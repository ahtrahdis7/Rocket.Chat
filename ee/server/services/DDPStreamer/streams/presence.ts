import { Stream } from '../Streamer';
import { STREAM_NAMES } from '../constants';

export const userpresence = new Stream(STREAM_NAMES.PRESENCE);

userpresence.allowRead('all');
