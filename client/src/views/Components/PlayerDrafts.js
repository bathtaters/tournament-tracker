import React from "react";
import PropTypes from "prop-types";

import { useSettingsQuery } from "../../models/baseApi";
import { usePlayerDraftsQuery } from "../../models/playerApi";

import { formatQueryError, statusInfo } from "../../assets/strings";
import { dayClasses } from "../../controllers/getDays";
import { getStatus } from "../../controllers/draftHelpers";

// Component layout
const scheduleRows = [
  { 
    title: 'Day', 
    value: d => d.day ? d.day.slice(5,10).replace('-','/') : 'None', 
    class: d => dayClasses(d.day.slice(0,10)).titleCls 
  },
  { title: 'Draft', value: d => d.title, span: 3, link: d => `/draft/${d.id}` },
  {
    title: 'Status', span: 2,
    value: (d,s) => statusInfo[s].label + (d.isdrop ? " (Dropped)" : ""),
    class: (_,s) => statusInfo[s].class
  },
  { title: 'Wins', value: d => d.wins, hideBelow: 2 },
  { title: 'Losses', value: d => d.count - d.wins - d.draws, hideBelow: 2 },
  { title: 'Draws', value: d => d.draws, hideBelow: 2 },
]
const scheduleGridClass = `grid-cols-${scheduleRows.reduce((c,r) => c + (r.span || 1),0)}`;

// Main component
function PlayerDrafts({ id }) {
  const { data: settings } = useSettingsQuery();
  const { data, isLoading, error } = usePlayerDraftsQuery(id);

  return pug`
    .my-4
      h3.dim-color.mt-4.font-thin Schedule
      if isLoading
        h4.base-color.font-thin Loading...

      else if error || !Array.isArray(data)
        h4.base-color.font-thin.italic= error ? formatQueryError(error) : 'Invalid data: '+JSON.stringify(data)

      else
        .grid.grid-flow-row.gap-x-2.gap-y-1.mx-4(className=scheduleGridClass)
          each row in scheduleRows
            h4(
              key="HDR_"+row.title
              className=(row.span ? "col-span-"+row.span : "")
            )= row.title

          each draft in data
            -var status = getStatus(draft)
            each row in scheduleRows
              if !row.hideBelow || row.hideBelow <= status
                h4.font-thin.base-color(
                  key=draft.id+"_"+row.title
                  className=(row.span ? " col-span-"+row.span : "")
                )
                  if row.link
                    a(
                      href=row.link(draft,status)
                      className=(row.class ? row.class(draft,status): '')
                    )= row.value(draft,status)

                  else
                    span(className=(row.class ? row.class(draft,status): ''))= row.value(draft,status)

              else
                div(key=draft.id+"_"+row.title className=(row.span ? "col-span-"+row.span : ""))

      if settings && settings.showrawjson
        p.mt-8.font-thin.dim-color= JSON.stringify(data)
  `;
}

PlayerDrafts.propTypes = { id: PropTypes.string };

export default PlayerDrafts;