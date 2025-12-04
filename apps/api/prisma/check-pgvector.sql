-- Check if pgVector extension is installed
SELECT * FROM pg_available_extensions WHERE name = 'vector';

-- Check if pgVector extension is enabled in current database
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Instructions to install pgVector on PostgreSQL server:
-- 
-- Option 1: Using package manager (Ubuntu/Debian)
-- $ sudo apt install postgresql-16-pgvector
--
-- Option 2: Build from source
-- $ git clone --branch v0.5.1 https://github.com/pgvector/pgvector.git
-- $ cd pgvector
-- $ make
-- $ sudo make install
--
-- After installation, enable the extension:
-- CREATE EXTENSION IF NOT EXISTS vector;
