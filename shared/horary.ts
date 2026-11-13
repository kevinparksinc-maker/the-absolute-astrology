export const HORARY_TOPICS = [
  { house: 1, label: "Condition, identity, or personal initiative" },
  { house: 2, label: "Money, possessions, or personal resources" },
  { house: 3, label: "Messages, siblings, neighbors, or short trips" },
  { house: 4, label: "Home, family, property, or the end of a matter" },
  { house: 5, label: "Romance, children, creativity, or pleasure" },
  { house: 6, label: "Work routines, service, or everyday wellbeing" },
  { house: 7, label: "A partner, counterpart, or another person" },
  { house: 8, label: "Shared resources, debt, or obligations" },
  { house: 9, label: "Higher study, belief, publishing, or long journeys" },
  { house: 10, label: "Career, reputation, authority, or a public outcome" },
  { house: 11, label: "Friends, groups, support, or hopes" },
  { house: 12, label: "Private matters, isolation, or hidden constraints" },
] as const;

export type HoraryTopicHouse = (typeof HORARY_TOPICS)[number]["house"];
