import { ensureAnonymousUser, supabase } from './supabase'

const requireClient = () => {
  if (!supabase) throw new Error('Supabase is not configured. Add the project URL and publishable key to .env.local.')
  return supabase
}

const normaliseRoom = (room) => ({
  id: room.room_id,
  code: room.room_code,
  documentMode: room.document_mode,
  participantId: room.participant_id,
})

export async function createPairRoom({ documentMode, displayName, avatar }) {
  await ensureAnonymousUser()
  const { data, error } = await requireClient().rpc('create_pair_room', {
    p_document_mode: documentMode,
    p_display_name: displayName,
    p_avatar: avatar ?? 0,
  })
  if (error) throw error
  if (!data?.[0]) throw new Error('The room was created but no player session was returned.')
  return normaliseRoom(data[0])
}

export async function joinPairRoom({ roomCode, displayName, avatar }) {
  await ensureAnonymousUser()
  const { data, error } = await requireClient().rpc('join_pair_room', {
    p_room_code: roomCode,
    p_display_name: displayName,
    p_avatar: avatar ?? 0,
  })
  if (error) throw error
  if (!data?.[0]) throw new Error('The room could not be opened.')
  return normaliseRoom(data[0])
}

export async function getPairRoom(roomId) {
  const client = requireClient()
  const [{ data: room, error: roomError }, { data: participants, error: participantError }] = await Promise.all([
    client.from('pair_rooms').select('id, room_code, document_mode, created_by').eq('id', roomId).single(),
    client.from('pair_participants').select('id, user_id, display_name, avatar, progress, score, is_complete, joined_at').eq('room_id', roomId).order('joined_at'),
  ])
  if (roomError) throw roomError
  if (participantError) throw participantError
  return { room, participants }
}

export function subscribeToPairRoom(roomId, onChange, onError) {
  const client = requireClient()
  const refresh = () => getPairRoom(roomId).then(onChange).catch(onError)
  const channel = client
    .channel(`pair-room:${roomId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pair_participants', filter: `room_id=eq.${roomId}` }, refresh)
    .subscribe()

  refresh()
  return () => client.removeChannel(channel)
}

export async function savePairProgress({ participantId, score, progress, isComplete }) {
  const { error } = await requireClient()
    .from('pair_participants')
    .update({ score, progress, is_complete: isComplete, updated_at: new Date().toISOString() })
    .eq('id', participantId)
  if (error) throw error
}
