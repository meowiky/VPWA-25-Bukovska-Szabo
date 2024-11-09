-- Insert sample data for users
INSERT INTO users (id, nickname, surname, name, email, password, state, registered_at, last_active_state)
VALUES
  (1, 'user1', 'Doe', 'John', 'j@j.com', '123', 'online', '2020-01-01T00:00:00.000Z', '2020-01-01T00:00:00.000Z'),
  (2, 'user2', 'Doe', 'Jane', 'j2@j.com', '123', 'online', '2020-01-01T00:00:00.000Z', '2020-01-01T00:00:00.000Z'),
  (3, 'lulu', 'idkpriezvisko', 'lucia', 'lu@gmail.com', '123', 'online', '2020-01-01T00:00:00.000Z',
  '2020-01-01T00:00:00.000Z'),
  (4, 'pete', 'surname', 'Peter', 'pete@gmail.com', '123', 'online', '2020-01-01T00:00:00.000Z', '2020-01-01T00:00:00.000Z'),
  (5, 'Duro', 'surname', 'Juraj', 'juro@gmail.com', '123', 'online', '2020-01-01T00:00:00.000Z', '2020-01-01T00:00:00.000Z');

-- Insert sample data for channels
INSERT INTO channels (id, name, visibility, admin_id, last_active)
VALUES
  (1, 'general', 'public', 1, '2020-01-01T00:00:00.000Z'),
  (2, 'private_channel', 'private', 1, '2020-01-01T00:00:00.000Z'),
  (3, 'super_channel', 'private', 3, '2020-01-03T09:00:00.000Z'),
  (4, 'channel_without_lulu', 'public', 1, '2020-01-03T11:30:00.000Z');

-- Insert sample data for user_channel (many-to-many relation)
INSERT INTO channel_user_pivots (user_id, channel_id)
VALUES
  (1, 1), (2, 1), (3, 1),  -- Users in the 'general' channel
  (1, 2), (2, 2), (3, 2),  -- Users in the 'private_channel'
  (1, 3), (2, 3), (3, 3),  -- Users in the 'super_channel'
  (1, 4), (2, 4);          -- Users in the 'channel_without_lulu'

-- Insert sample data for messages
INSERT INTO messages (user_id, channel_id, sent_at, message)
VALUES
  (1, 1, '2020-01-01T00:00:00.000Z', 'Hello!'),
  (2, 1, '2020-01-01T00:00:00.000Z', 'Hey there!'),
  (1, 2, '2020-01-01T00:00:00.000Z', 'Hello there!'),
  (2, 2, '2020-01-01T00:00:00.000Z', 'Hi!'),
  (1, 3, '2020-01-03T09:00:00.000Z', 'Is this the new channel everyone’s talking about?'),
  (3, 3, '2020-01-03T09:05:00.000Z', 'Yes, it’s a private one!'),
  (2, 3, '2020-01-03T09:10:00.000Z', 'Cool! Looking forward to some good discussions here.'),
  (3, 3, '2020-01-03T09:15:00.000Z', 'Let’s start by setting some ground rules.'),
  (2, 3, '2020-01-03T09:20:00.000Z', 'Good idea. Everyone should stay respectful.'),
  (1, 3, '2020-01-03T09:25:00.000Z', 'And keep the conversation productive!'),
  (3, 3, '2020-01-03T09:30:00.000Z', 'We should organize a team meeting soon.'),
  (1, 3, '2020-01-03T09:35:00.000Z', 'Agreed. A kickoff meeting sounds great.'),
  (2, 3, '2020-01-03T09:40:00.000Z', 'How about this Friday?'),
  (1, 3, '2020-01-03T09:45:00.000Z', 'Friday works for me.'),
  (2, 3, '2020-01-03T09:50:00.000Z', 'Same here.'),
  (3, 3, '2020-01-03T09:55:00.000Z', 'Let’s schedule it then!'),
  (1, 3, '2020-01-03T10:00:00.000Z', 'I’ll send out the invites.'),
  (2, 3, '2020-01-03T10:05:00.000Z', 'Thanks, @lulu!'),
  (3, 3, '2020-01-03T10:10:00.000Z', 'No problem!'),
  (2, 3, '2020-01-03T10:15:00.000Z', 'What’s the agenda for the meeting?'),
  (1, 3, '2020-01-03T10:20:00.000Z', 'I’ll draft an agenda today.'),
  (3, 3, '2020-01-03T10:25:00.000Z', 'Great, make sure to include time for brainstorming.'),
  (2, 3, '2020-01-03T10:30:00.000Z', 'Of course! We need to generate new ideas.'),
  (1, 3, '2020-01-03T10:35:00.000Z', 'What about the project updates?'),
  (3, 3, '2020-01-03T10:40:00.000Z', 'That should be the first topic.'),
  (2, 3, '2020-01-03T10:45:00.000Z', 'Agreed. We need to review progress.'),
  (1, 3, '2020-01-03T10:50:00.000Z', 'How’s everyone feeling about the current timeline?'),
  (2, 3, '2020-01-03T10:55:00.000Z', 'I think we’re a bit behind.'),
  (3, 3, '2020-01-03T11:00:00.000Z', 'Yeah, we might need to extend it.'),
  (1, 3, '2020-01-03T11:05:00.000Z', 'Let’s discuss it at the meeting.'),
  (2, 3, '2020-01-03T11:10:00.000Z', 'Good plan!'),
  (1, 3, '2020-01-03T11:15:00.000Z', 'What about our next milestones?'),
  (3, 3, '2020-01-03T11:20:00.000Z', 'We should revisit those too.'),
  (1, 3, '2020-01-03T11:25:00.000Z', 'I’ll make a list of suggestions.'),
  (2, 3, '2020-01-03T11:30:00.000Z', 'Sounds good!');
