import { RxAndReduxCodePage } from './app.po';

describe('rx-and-redux-code App', () => {
  let page: RxAndReduxCodePage;

  beforeEach(() => {
    page = new RxAndReduxCodePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
