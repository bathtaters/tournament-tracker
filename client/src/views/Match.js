import React from "react";
import PropTypes from 'prop-types';

function Match(props) {
  return pug`
    .p-2.m-1.border.border-gray-600
      .text-center
        each playerId, index in Object.keys(props.data.players)
          if index
            .inline-block.font-thin.text-sm.text-gray-400.p-2.align-top vs.

          .inline-block
            h4.mb-0.pb-0.block
              a.font-light(href="/profile?id="+playerId)= props.players[playerId].name

            .text-xs.font-thin.text-gray-400.mt-0.pt-0= '[ '+props.players[playerId].record.join(' - ')+' ]'
      
      .flex.justify-evenly.text-center(className=(props.data.reported ? "text-green-400" : "text-red-400"))
        if props.data.reported
          each playerId, index in Object.keys(props.data.players)
            if index
              span.inline-block= ' – '

            .inline-block= props.data.players[playerId]
            
        else
          a.text-sm.font-light.mt-2(href="#report-"+props.data.id) Report
      
      if props.data.reported && props.data.draws
        .text-center.w-full.italic.font-thin.text-xs(className=(props.data.reported ? "text-green-400" : "text-red-400"))= props.data.draws+' draw'+(props.data.draws===1?'':'s')
  `;
}

Match.propTypes = {
  data: PropTypes.object,
  players: PropTypes.object,
};

export default Match;