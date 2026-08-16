const avatar = (id, sourceId, characterId, name) => ({
  id,
  name,
  idle: `Avatars/roadmap/nonselect-${sourceId}.png`,
  selected: `Avatars/roadmap/selected-${sourceId}.png`,
  character: `Avatars/roadmap/char-${characterId}.png`,
})

// Ordered to match the supplied mobile design reference.
export const avatars = [
  avatar(0, 2, 8, 'Origami maker'),
  avatar(1, 3, 7, 'Traditional artist'),
  avatar(2, 4, 6, 'Creative student'),
  avatar(3, 1, 5, 'Digital student'),
  avatar(4, 5, 4, 'Student adviser'),
  avatar(5, 6, 3, 'Visual artist'),
  avatar(6, 8, 2, 'Career coach'),
  avatar(7, 7, 1, 'Blue-haired student'),
]
