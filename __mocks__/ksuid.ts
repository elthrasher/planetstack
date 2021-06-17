// See https://dev.to/elthrasher/mocking-aws-with-jest-and-typescript-199i
const KSUID = {
  random: (): { string: string } => ({
    string: 'notsorandom',
  }),
};

export default KSUID;
