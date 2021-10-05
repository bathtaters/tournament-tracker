import React from "react";
import { useParams } from "react-router-dom";
import PropTypes from 'prop-types';
import Match from "./Match";

// Change props.data['d1'] to [id] when I figure out URL params

function Draft(props) {
  let { id } = useParams();
  return pug`
    div
      h2.text-center.font-thin= props.data[id || 'd1'].title
      .flex.flex-row.flex-wrap.justify-start
        each round, index in props.data['d1'].matches
          .m-5
            h3.font-light.text-center= 'Round '+(index+1)
            .flex.flex-col
              each match in round
                Match(data=match players=props.players)

        if props.data['d1'].ranking && props.data['d1'].ranking.length
          .m-5
            h3.font-light.text-center Standings
            ol.list-decimal.list-inside.text-gray-500.font-thin
              each playerId in props.data['d1'].ranking
                li.font-normal
                  a.mr-2(href="/profile?id="+playerId)= props.players[playerId].name
                  span.font-light.text-xs.align-middle= props.players[playerId].record.join(' - ')
  `;
}

Draft.propTypes = {
  data: PropTypes.object,
  players: PropTypes.object,
};

export default Draft;