CREATE SCHEMA IF NOT EXISTS reality;

-- Matches ponder's question view schema exactly so data is directly comparable.
CREATE TABLE IF NOT EXISTS reality.question (
  id                               text           PRIMARY KEY,
  question_id                      text           NOT NULL,
  contract                         text           NOT NULL,
  chain_id                         integer        NOT NULL,
  template_id                      numeric(78,0)  NOT NULL,
  nonce                            numeric(78,0)  NOT NULL,
  data                             text           NOT NULL,
  title                            text,
  type                             text,
  category                         text,
  lang                             text,
  outcomes                         text,
  question_json                    text,
  creator                          text           NOT NULL,
  arbitrator                       text           NOT NULL,
  opening_timestamp                numeric(78,0)  NOT NULL,
  timeout                          numeric(78,0)  NOT NULL,
  content_hash                     text           NOT NULL,
  current_answer                   text,
  current_answer_bond              numeric(78,0)  NOT NULL,
  current_answer_timestamp         numeric(78,0),
  history_hash                     text,
  min_bond                         numeric(78,0)  NOT NULL,
  last_bond                        numeric(78,0)  NOT NULL,
  cumulative_bonds                 numeric(78,0)  NOT NULL,
  bounty                           numeric(78,0)  NOT NULL,
  is_pending_arbitration           boolean        NOT NULL,
  arbitration_occurred             boolean        NOT NULL,
  arbitration_requested_timestamp  numeric(78,0),
  arbitration_requested_by         text,
  answer_finalized_timestamp       numeric(78,0),
  scheduled_finalization_timestamp numeric(78,0)  NOT NULL,
  reopens_question_id              text,
  created_block                    numeric(78,0)  NOT NULL,
  created_log_index                numeric(78,0)  NOT NULL,
  created_tx_hash                  text           NOT NULL,
  created_timestamp                numeric(78,0)  NOT NULL,
  updated_block                    numeric(78,0)  NOT NULL,
  updated_timestamp                numeric(78,0)  NOT NULL
);

CREATE INDEX IF NOT EXISTS reality_q_chain      ON reality.question (chain_id);
CREATE INDEX IF NOT EXISTS reality_q_creator    ON reality.question (creator);
CREATE INDEX IF NOT EXISTS reality_q_updated    ON reality.question (updated_timestamp);
CREATE INDEX IF NOT EXISTS reality_q_created    ON reality.question (created_timestamp);
CREATE INDEX IF NOT EXISTS reality_q_sft        ON reality.question (scheduled_finalization_timestamp);
CREATE INDEX IF NOT EXISTS reality_q_template   ON reality.question (template_id);
CREATE INDEX IF NOT EXISTS reality_q_arbitrator ON reality.question (arbitrator);
CREATE INDEX IF NOT EXISTS reality_q_category   ON reality.question (category);
CREATE INDEX IF NOT EXISTS reality_q_contract   ON reality.question (contract);
CREATE INDEX IF NOT EXISTS reality_q_arb_pend   ON reality.question (is_pending_arbitration);
CREATE INDEX IF NOT EXISTS reality_q_reopener   ON reality.question (reopens_question_id);

CREATE TABLE IF NOT EXISTS reality.response (
  id                text          PRIMARY KEY,
  question_id       text          NOT NULL,
  answer            text,
  commitment_hash   text,
  bond              numeric(78,0) NOT NULL,
  "user"            text          NOT NULL,
  history_hash      text          NOT NULL,
  is_commitment     boolean       NOT NULL,
  is_unrevealed     boolean       NOT NULL,
  timestamp         numeric(78,0) NOT NULL,
  created_block     numeric(78,0) NOT NULL,
  created_log_index numeric(78,0) NOT NULL,
  created_tx_hash   text          NOT NULL,
  revealed_block    numeric(78,0)
);

CREATE INDEX IF NOT EXISTS reality_r_qid       ON reality.response (question_id);
CREATE INDEX IF NOT EXISTS reality_r_q_bond    ON reality.response (question_id, bond);
CREATE INDEX IF NOT EXISTS reality_r_user      ON reality.response (user);
CREATE INDEX IF NOT EXISTS reality_r_timestamp ON reality.response (timestamp);

CREATE TABLE IF NOT EXISTS reality.template (
  id                text          PRIMARY KEY,
  template_id       numeric(78,0) NOT NULL,
  contract          text          NOT NULL,
  chain_id          integer       NOT NULL,
  "user"            text          NOT NULL,
  question_text     text,
  created_block     numeric(78,0) NOT NULL,
  created_log_index numeric(78,0) NOT NULL,
  created_tx_hash   text          NOT NULL,
  created_timestamp numeric(78,0) NOT NULL
);

CREATE INDEX IF NOT EXISTS reality_t_template  ON reality.template (template_id);
CREATE INDEX IF NOT EXISTS reality_t_chain     ON reality.template (chain_id);
CREATE INDEX IF NOT EXISTS reality_t_contract  ON reality.template (contract);
CREATE INDEX IF NOT EXISTS reality_t_user      ON reality.template (user);
CREATE INDEX IF NOT EXISTS reality_t_created   ON reality.template (created_timestamp);

CREATE TABLE IF NOT EXISTS reality.claim (
  id                text          PRIMARY KEY,
  question_id       text          NOT NULL,
  "user"            text          NOT NULL,
  amount            numeric(78,0) NOT NULL,
  created_block     numeric(78,0) NOT NULL,
  created_timestamp numeric(78,0) NOT NULL
);

CREATE INDEX IF NOT EXISTS reality_c_user     ON reality.claim (user);
CREATE INDEX IF NOT EXISTS reality_c_question ON reality.claim (question_id);

-- One row per chain; last_block is the highest block fully processed.
CREATE TABLE IF NOT EXISTS reality.sync_state (
  chain_id   integer PRIMARY KEY,
  last_block bigint  NOT NULL
);

-- Block hashes for every block that contained at least one indexed event.
-- Used to detect reorgs of template/question events (not just bond contradictions).
-- confirmed is set after the block reaches CONFIRM_DEPTH finality and hash re-check passes.
CREATE TABLE IF NOT EXISTS reality.processed_block (
  chain_id     integer NOT NULL,
  block_number bigint  NOT NULL,
  block_hash   text    NOT NULL,
  confirmed    boolean NOT NULL DEFAULT false,
  PRIMARY KEY (chain_id, block_number)
);

CREATE INDEX IF NOT EXISTS reality_pb_unconfirmed
  ON reality.processed_block (chain_id, block_number) WHERE NOT confirmed;
