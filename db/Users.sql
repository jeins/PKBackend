CREATE TABLE users
(
  id serial NOT NULL,
  email character varying(255) NOT NULL,
  password character varying(255) NOT NULL,
  full_name character varying(255) NOT NULL,
  hash character varying(255),
  active boolean NOT NULL,
  created_at timestamp without time zone NOT NULL,
  updated_at timestamp without time zone NOT NULL,
  CONSTRAINT users_pkey PRIMARY KEY (id)
)