-- supabase/schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types for game state
CREATE TYPE room_status AS ENUM ('waiting', 'in_progress', 'completed');
CREATE TYPE player_role AS ENUM ('government', 'bank', 'investor', 'citizen');
CREATE TYPE game_phase AS ENUM ('policy_selection', 'player_actions', 'resolution', 'results');

-- Rooms table
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(6) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    status room_status DEFAULT 'waiting',
    current_round INTEGER DEFAULT 0,
    max_rounds INTEGER DEFAULT 10,
    phase game_phase DEFAULT 'policy_selection',
    round_duration INTEGER DEFAULT 60, -- seconds
    round_started_at TIMESTAMPTZ,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players table
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    role player_role,
    score INTEGER DEFAULT 0,
    is_connected BOOLEAN DEFAULT true,
    is_ready BOOLEAN DEFAULT false,
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(room_id, name)
);

-- Game state table (one per room)
CREATE TABLE game_state (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID UNIQUE REFERENCES rooms(id) ON DELETE CASCADE,
    financial_stability INTEGER DEFAULT 70 CHECK (financial_stability >= 0 AND financial_stability <= 100),
    economic_growth INTEGER DEFAULT 50 CHECK (economic_growth >= 0 AND economic_growth <= 100),
    market_risk INTEGER DEFAULT 30 CHECK (market_risk >= 0 AND market_risk <= 100),
    public_trust INTEGER DEFAULT 60 CHECK (public_trust >= 0 AND public_trust <= 100),
    current_policy VARCHAR(50),
    current_event VARCHAR(100),
    event_modifier JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Decisions table (player actions per round)
CREATE TABLE decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    round INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    score_change INTEGER DEFAULT 0,
    UNIQUE(room_id, player_id, round)
);

-- History table (for analytics and replay)
CREATE TABLE history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    round INTEGER NOT NULL,
    phase game_phase NOT NULL,
    policy VARCHAR(50),
    event VARCHAR(100),
    state_snapshot JSONB NOT NULL,
    decisions_summary JSONB NOT NULL,
    scores_snapshot JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_players_room ON players(room_id);
CREATE INDEX idx_decisions_room_round ON decisions(room_id, round);
CREATE INDEX idx_history_room ON history(room_id);
CREATE INDEX idx_rooms_code ON rooms(code);

-- Row Level Security
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;

-- Policies (permissive for this demo - adjust for production)
CREATE POLICY "Allow all operations on rooms" ON rooms FOR ALL USING (true);
CREATE POLICY "Allow all operations on players" ON players FOR ALL USING (true);
CREATE POLICY "Allow all operations on game_state" ON game_state FOR ALL USING (true);
CREATE POLICY "Allow all operations on decisions" ON decisions FOR ALL USING (true);
CREATE POLICY "Allow all operations on history" ON history FOR ALL USING (true);

-- Functions
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS VARCHAR(6) AS $$
DECLARE
    chars VARCHAR(36) := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result VARCHAR(6) := '';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate room code
CREATE OR REPLACE FUNCTION set_room_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.code IS NULL THEN
        NEW.code := generate_room_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_room_code
    BEFORE INSERT ON rooms
    FOR EACH ROW
    EXECUTE FUNCTION set_room_code();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_rooms_updated
    BEFORE UPDATE ON rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_game_state_updated
    BEFORE UPDATE ON game_state
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE game_state;
ALTER PUBLICATION supabase_realtime ADD TABLE decisions;
