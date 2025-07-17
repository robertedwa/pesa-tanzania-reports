-- Remove all Tanzania mobile money transactions (M-Pesa and Airtel)
DELETE FROM contributions WHERE payment_method IN ('mpesa', 'airtel');