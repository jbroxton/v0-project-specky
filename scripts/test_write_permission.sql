-- Function to test write permissions without actually modifying data
CREATE OR REPLACE FUNCTION test_write_permission()
RETURNS boolean AS $$
BEGIN
  -- Start a transaction
  BEGIN;
    -- Try to create a temporary table
    CREATE TEMPORARY TABLE _write_test_temp (
      id SERIAL PRIMARY KEY,
      test_value TEXT
    );
    
    -- Try to insert a row
    INSERT INTO _write_test_temp (test_value) VALUES ('test');
    
    -- Check if the row was inserted
    PERFORM * FROM _write_test_temp WHERE test_value = 'test';
    
    -- If we got here, we have write permission
    -- Roll back the transaction so we don't actually modify anything
    ROLLBACK;
    
    RETURN TRUE;
  EXCEPTION WHEN OTHERS THEN
    -- Roll back on error
    ROLLBACK;
    RAISE;
  END;
END;
$$ LANGUAGE plpgsql;
