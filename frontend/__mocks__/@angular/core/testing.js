// Mock complet pour @angular/core/testing - Jest uniquement
module.exports = {
  TestBed: {
    configureTestingModule: jest.fn((config) => ({
      compileComponents: jest.fn(() => Promise.resolve()),
      overrideComponent: jest.fn(() => TestBed),
      overrideDirective: jest.fn(() => TestBed),
      overrideModule: jest.fn(() => TestBed),
      overridePipe: jest.fn(() => TestBed)
    })),
    createComponent: jest.fn(() => ({
      componentInstance: {},
      detectChanges: jest.fn(),
      destroy: jest.fn(),
      debugElement: {
        query: jest.fn(),
        queryAll: jest.fn(),
        nativeElement: document.createElement('div')
      },
      nativeElement: document.createElement('div'),
      changeDetectorRef: {
        detectChanges: jest.fn(),
        markForCheck: jest.fn()
      }
    })),
    inject: jest.fn((token) => {
      // Retourner des mocks appropriés selon le token
      if (typeof token === 'function') {
        return new token();
      }
      return {};
    }),
    get: jest.fn((token) => {
      if (typeof token === 'function') {
        return new token();
      }
      return {};
    }),
    compileComponents: jest.fn(() => Promise.resolve()),
    resetTestingModule: jest.fn(),
    initTestEnvironment: jest.fn(),
    resetTestEnvironment: jest.fn()
  },
  ComponentFixture: class {
    constructor() {
      this.componentInstance = {};
      this.debugElement = {
        query: jest.fn(),
        queryAll: jest.fn(),
        nativeElement: document.createElement('div')
      };
      this.nativeElement = document.createElement('div');
    }
    
    detectChanges() {
      return jest.fn();
    }
    
    destroy() {
      return jest.fn();
    }
  },
  waitForAsync: jest.fn((fn) => fn),
  fakeAsync: jest.fn((fn) => fn),
  tick: jest.fn(),
  flush: jest.fn(),
  discardPeriodicTasks: jest.fn(),
  flushMicrotasks: jest.fn()
}; 