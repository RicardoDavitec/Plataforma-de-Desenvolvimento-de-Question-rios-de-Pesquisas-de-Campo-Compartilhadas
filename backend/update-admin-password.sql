UPDATE researchers 
SET password = '$2b$10$uYDUQY5uyKktTr7gvXrGKeh1Z3fZPK84B7wP7vyc2SZNccT4o0nJC' 
WHERE email = 'admin@teste.com';

SELECT name, email FROM researchers WHERE email = 'admin@teste.com';
