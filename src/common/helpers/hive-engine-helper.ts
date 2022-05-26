import {
  DOWNVOTE_REGENERATION_DAYS,
  MAX_VOTING_POWER,
  VOTE_REGENERATION_DAYS,
} from '../constants';
import { EngineVotingPowerType } from '../../services/hive-engine-api/types';
import { CalculateManaType } from './types';
/*
  VOTE_REGENERATION_DAYS and DOWNVOTE_REGENERATION_DAYS can vary
  and depends on comment contract can be added as param in future
 */

export const calculateMana = (
  votingPower: EngineVotingPowerType,
): CalculateManaType => {
  const timestamp = new Date().getTime();
  const result = {
    votingPower: votingPower.votingPower,
    downvotingPower: votingPower.downvotingPower,
    lastVoteTimestamp: votingPower.lastVoteTimestamp,
  };

  result.votingPower +=
    ((timestamp - result.lastVoteTimestamp) * MAX_VOTING_POWER) /
    (VOTE_REGENERATION_DAYS * 24 * 3600 * 1000);
  result.votingPower = Math.floor(result.votingPower);
  result.votingPower = Math.min(result.votingPower, MAX_VOTING_POWER);

  result.downvotingPower +=
    ((timestamp - result.lastVoteTimestamp) * MAX_VOTING_POWER) /
    (DOWNVOTE_REGENERATION_DAYS * 24 * 3600 * 1000);
  result.downvotingPower = Math.floor(result.downvotingPower);
  result.downvotingPower = Math.min(result.downvotingPower, MAX_VOTING_POWER);
  return result;
};
