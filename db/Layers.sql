CREATE TABLE layers
(
  id serial NOT NULL,
  user_id integer NOT NULL,
  name character varying(255) NOT NULL,
  workspace character varying(255) NOT NULL,
  description character varying(255) NOT NULL,
  created_at timestamp without time zone NOT NULL,
  updated_at timestamp without time zone NOT NULL,
  CONSTRAINT layers_pkey PRIMARY KEY (id),
  CONSTRAINT layers_user_id FOREIGN KEY (user_id)
      REFERENCES users (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)