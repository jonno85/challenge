export interface OutcomeSuccess {
  outcome: 'SUCCESS';
  data: any;
}

export interface OutcomeFailure {
  outcome: 'FAILURE';
  error: {
    message: string;
    errorCode: string;
  };
}
