import React, { useRef, useEffect } from "react";
import { useParams } from "react-router-dom";

import Round from "./Components/Round";
import DraftStats from "./Components/DraftStats";
import EditDraft from "./Components/EditDraft";
import Modal from "./Components/Modal";
import RawData from "./Components/RawData";

import {
  useDraftQuery, useNextRoundMutation, useClearRoundMutation, 
} from "../models/draftApi";
import { usePrefetch } from "../models/baseApi";

import { deleteRoundMsg, formatQueryError } from "../assets/strings";
import { getRoundButton } from "../controllers/draftHelpers";

function Draft() {
  // Local
  let { id } = useParams();
  const modal = useRef(null);

  // Global
  const { data, isLoading, error, isFetching } = useDraftQuery(id);
  const matches = (data && data.matches) || [];

  // Get Match data
  const prefetchMatch = usePrefetch('match');
  useEffect(() => { prefetchMatch(id); }, [id]);
  
  // Actions
  const [ nextRound ] = useNextRoundMutation();
  const [ prevRound ] = useClearRoundMutation();
  const handleDelete = () => {
    if (!window.confirm(deleteRoundMsg)) return;
    prevRound(id)
  }
  
  if (isLoading)
    return <h3 className="italic text-center font-thin">Loading...</h3>;

  else if (error || data.error)
    return <h3 className="italic text-center font-thin">{formatQueryError(error || data.error)}</h3>;
  
  else if (!data)
    return <h3 className="italic text-center font-thin">Draft not found</h3>;
  
  // Load Round boxes
  let rounds = [];
  for (let roundNum = matches.length; roundNum > 0; roundNum--) {
    rounds.push(
      <Round
        key={id+'.'+roundNum}
        draftId={id}
        round={roundNum - 1}
        deleteRound={roundNum === matches.length ? handleDelete : null}
      />
    );
  }

  return (
    <div>
      <h2 className="text-center font-thin">{data.title}</h2>
      <form className="text-center my-4">
        <input
          disabled={isFetching || data.canadvance === false || data.status > 2}
          onClick={()=>nextRound(id)}
          type="button"
          value={getRoundButton(data)}
        />
      </form>
      <div className="flex flex-row flex-wrap justify-evenly">
        <div className="text-center font-light">
          <h4 className="font-thin max-color">
            { data.status === 2 ? (<>
              <span className="mr-2">Round</span>
              <span className="mr-2 sm:text-2xl">{data.roundactive}</span>
              <span className="mr-2">of</span>
              <span className="sm:text-2xl">{data.roundcount}</span>
            </>) : data.status ? (
              <span>{data.status === 1 ? 'Not started' : 'Complete'}</span>
            ) : null }
          </h4>
          { data.playerspermatch && data.wincount ? (
            <h5 className="pt-0 italic dim-color">
              {data.playerspermatch}-player, first to {data.wincount}
            </h5>
          ) : null }
          <form className="text-center my-6">
            <input
              className="dim-color font-light"
              onClick={()=>modal.current.open()}
              type="button"
              value="Edit Settings"
            />
          </form>
          { data.players && data.players.length ? <DraftStats draftId={id} /> : null }
        </div>
        {rounds}
      </div>

      <RawData data={data} />

      <Modal ref={modal}>
        <EditDraft
          draftId={id}
          hideModal={force=>modal.current.close(force)}
          lockModal={()=>modal.current.lock()}
        />
      </Modal>
    </div>
  );
}

export default Draft;