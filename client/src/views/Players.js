import React from "react";
import PropTypes from 'prop-types';
import Stats from "./Components/Stats";

function Players(props) {
  return pug`
    h2.font-thin.text-center.mb-6 Player Stats
    .px-6.flex.justify-center
      Stats(ranking=props.ranking players=props.players)
  `;
}

Players.propTypes = {
  ranking: PropTypes.arrayOf(PropTypes.string),
  players: PropTypes.object,
};

export default Players;