import { ResourceNamePipe } from './resource-name.pipe';

describe('ResourceNamePipe', () => {
  it('create an instance', () => {
    const pipe = new ResourceNamePipe();
    expect(pipe).toBeTruthy();
  });
});
