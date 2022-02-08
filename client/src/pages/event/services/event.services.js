// Import
import { roundButtonText } from "../../../assets/strings";

// Round Button label
// [0: N/A, 1: Start, 2: Not Reported, 3: Next, 4: End, 5: Complete]
export const getRoundButton = event => roundButtonText[
  !event ? 0 : event.roundactive === 0 ? 1 :
  event.roundactive > event.roundcount ? 5 :
  event.canadvance === false ? 2 :
  event.roundactive === event.roundcount ? 4 : 3
];

// Generate temp round
export const fakeRound = (eventData) => {
  const playerCount = 
    (eventData.players ? eventData.players.length : 0) -
    (eventData.drops ? eventData.drops.length : 0);
  let round = [], size = eventData.playerspermatch ? Math.ceil(playerCount/eventData.playerspermatch) : 0;
  for (let i=0; i<size; i++) {
    round.push('TBD-'+i);
  }
  return round;
};