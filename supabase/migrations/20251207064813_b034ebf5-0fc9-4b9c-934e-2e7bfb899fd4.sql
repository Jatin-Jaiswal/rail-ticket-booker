-- Create an atomic booking function to prevent race conditions
CREATE OR REPLACE FUNCTION public.create_booking_atomic(
  p_user_id uuid,
  p_train_id uuid,
  p_booking_date date,
  p_journey_date date,
  p_passenger_name text,
  p_passenger_age integer,
  p_passenger_gender text,
  p_seat_numbers text[],
  p_total_amount numeric,
  p_payment_id text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking_id uuid;
  v_seat_record RECORD;
  v_unavailable_seats text[];
BEGIN
  -- Lock the seats table rows for this train to prevent concurrent modifications
  -- Check seat availability within the transaction
  SELECT array_agg(seat_number) INTO v_unavailable_seats
  FROM seats
  WHERE train_id = p_train_id
    AND seat_number = ANY(p_seat_numbers)
    AND (is_available = false OR (locked_by IS NOT NULL AND locked_by != p_user_id AND locked_until > now()))
  FOR UPDATE;

  -- If any seats are unavailable, raise an exception
  IF v_unavailable_seats IS NOT NULL AND array_length(v_unavailable_seats, 1) > 0 THEN
    RAISE EXCEPTION 'Seats % are no longer available', array_to_string(v_unavailable_seats, ', ');
  END IF;

  -- Verify all requested seats exist
  IF (SELECT COUNT(*) FROM seats WHERE train_id = p_train_id AND seat_number = ANY(p_seat_numbers)) != array_length(p_seat_numbers, 1) THEN
    RAISE EXCEPTION 'One or more seat numbers are invalid';
  END IF;

  -- Create the booking
  INSERT INTO bookings (
    user_id,
    train_id,
    booking_date,
    journey_date,
    passenger_name,
    passenger_age,
    passenger_gender,
    seat_numbers,
    total_amount,
    booking_status,
    payment_status,
    payment_id
  ) VALUES (
    p_user_id,
    p_train_id,
    p_booking_date,
    p_journey_date,
    p_passenger_name,
    p_passenger_age,
    p_passenger_gender,
    p_seat_numbers,
    p_total_amount,
    'confirmed',
    'completed',
    p_payment_id
  ) RETURNING id INTO v_booking_id;

  -- Update seat availability atomically
  UPDATE seats
  SET is_available = false,
      locked_by = NULL,
      locked_until = NULL
  WHERE train_id = p_train_id
    AND seat_number = ANY(p_seat_numbers);

  -- Update train available seats
  UPDATE trains
  SET available_seats = available_seats - array_length(p_seat_numbers, 1)
  WHERE id = p_train_id;

  RETURN v_booking_id;
END;
$$;