import { NgxsModule, Store } from '@ngxs/store';
import { async, TestBed } from '@angular/core/testing';
import { DictionaryState, DictionaryStateModel } from './dictionary.state';
import { DictionaryReset, SetDictionaryData } from './dictionary.actions';

const data = [
  {
    id: '232',
    departmentCode: '1234',
    departmentName: 'Main office',
    mainCuratorUserId: 'admin',
    mainCuratorName: 'Adam Ant',
    backupCuratorUserId: 'manager',
    backupCuratorName: 'King Leonidas'
  },
  {
    id: '777',
    departmentCode: '12321',
    departmentName: 'Ministry of Magic',
    mainCuratorUserId: 'manager',
    mainCuratorName: 'Professor Dumbledore',
    backupCuratorUserId: 'manager',
    backupCuratorName: 'HeWho Shallnot BeNamed'
  }
];

describe('[TEST]: Dictionary state', () => {
  let store: Store;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([DictionaryState])]
    })
      .compileComponents()
      .then();
    store = TestBed.get(Store);
  }));

  it('Should be correct dispatch and dictionary is empty', () => {
    const dictionary: DictionaryStateModel = {
      content: [],
      page: 0,
      size: 0,
      totalPages: 0,
      totalElements: 0
    };
    store.dispatch(new SetDictionaryData(dictionary));
    const actual = store.selectSnapshot(DictionaryState.getDictionaryState);
    expect(actual).toEqual(dictionary);
  });

  it('Should be state is filled DictionaryStateModel', () => {
    const dictionary: DictionaryStateModel = {
      content: data,
      page: 0,
      size: 20,
      totalPages: 2,
      totalElements: 1
    };
    store.dispatch(new SetDictionaryData(dictionary));
    const actual = store.selectSnapshot(DictionaryState.getDictionaryState);
    expect(actual).toEqual(dictionary);
  });

  it('should be reset state', () => {
    const dictionary: DictionaryStateModel = {
      content: [],
      page: 0,
      size: 0,
      totalPages: 0,
      totalElements: 0
    };
    store.dispatch(new DictionaryReset());
    const actual = store.selectSnapshot(DictionaryState.getDictionaryState);
    expect(actual).toEqual(dictionary);
  });
});
