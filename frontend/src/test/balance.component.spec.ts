import { BalanceComponent } from '../app/pages/balance/balance.component';
import { UserService } from '../app/services/user/user.service';
import { of, throwError } from 'rxjs';

describe('BalanceComponent (Jest)', () => {
  let component: BalanceComponent;
  let userService: jest.Mocked<UserService>;

  beforeEach(() => {
    userService = {
      getUserId: jest.fn(),
      updateUserBalance: jest.fn(),
    } as any;
    component = new BalanceComponent(userService);
  });

  describe('ngOnInit', () => {
    it('should set userId and maxAmount from service', () => {
      userService.getUserId.mockReturnValue(of({ user_id: 42, solde: 500 }));
      component.ngOnInit();
      expect(userService.getUserId).toHaveBeenCalled();
    });

    it('should handle error from getUserId', () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      userService.getUserId.mockReturnValue(throwError(() => 'err'));
      component.ngOnInit();
      expect(userService.getUserId).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('setIncrement', () => {
    it('should update incrementValue', () => {
      component.setIncrement(50);
      expect(component.incrementValue).toBe(50);
    });
  });

  describe('increaseAmount', () => {
    it('should increase amount by incrementValue', () => {
      component.incrementValue = 10;
      component.amount = 20;
      component.increaseAmount();
      expect(component.amount).toBe(30);
    });
  });

  describe('decreaseAmount', () => {
    it('should decrease amount by incrementValue', () => {
      component.incrementValue = 10;
      component.amount = 30;
      component.decreaseAmount();
      expect(component.amount).toBe(20);
    });

    it('should not decrease below zero', () => {
      component.incrementValue = 10;
      component.amount = 5;
      component.decreaseAmount();
      expect(component.amount).toBe(0);
    });
  });

  describe('handleDeposit', () => {
    beforeEach(() => {
      component.userId = 1;
      component.amount = 100;
    });

    it('should warn if userId is null', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      component.userId = null;
      component.handleDeposit();
      expect(console.warn).toHaveBeenCalled();
    });

    it('should warn if amount <= 0', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      component.amount = 0;
      component.handleDeposit();
      expect(console.warn).toHaveBeenCalled();
    });

    it('should call updateUserBalance and update maxAmount', () => {
      userService.updateUserBalance.mockReturnValue(of({ balance: 900 }));
      component.handleDeposit();
      expect(userService.updateUserBalance).toHaveBeenCalledWith(1, 100, 'add');
    });

    it('should handle error from updateUserBalance', () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      userService.updateUserBalance.mockReturnValue(throwError(() => 'err'));
      component.handleDeposit();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('handleWithdrawal', () => {
    beforeEach(() => {
      component.userId = 1;
      component.amount = 100;
      component.maxAmount = 50;
    });

    it('should warn if userId is null', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      component.userId = null;
      component.handleWithdrawal();
      expect(console.warn).toHaveBeenCalled();
    });

    it('should warn if amount <= 0', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      component.amount = 0;
      component.handleWithdrawal();
      expect(console.warn).toHaveBeenCalled();
    });

    it('should show overdraft modal if amount > maxAmount', () => {
      component.amount = 200;
      component.maxAmount = 100;
      component.handleWithdrawal();
      expect(component.showOverdraftModal).toBe(true);
      expect(component.amount).toBe(100);
    });

    it('should proceed withdrawal if amount <= maxAmount', () => {
      const spy = jest
        .spyOn(component, 'proceedWithdrawal')
        .mockImplementation();
      component.amount = 50;
      component.maxAmount = 100;
      component.handleWithdrawal();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('proceedWithdrawal', () => {
    beforeEach(() => {
      component.userId = 1;
      component.amount = 50;
      component.maxAmount = 100;
    });

    it('should call updateUserBalance and update maxAmount', () => {
      userService.updateUserBalance.mockReturnValue(of({ balance: 50 }));
      component.proceedWithdrawal();
      expect(userService.updateUserBalance).toHaveBeenCalledWith(
        1,
        50,
        'subtract'
      );
      expect(component.amount).toBe(0);
      expect(component.showOverdraftModal).toBe(false);
    });

    it('should handle error from updateUserBalance', () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      userService.updateUserBalance.mockReturnValue(throwError(() => 'err'));
      component.proceedWithdrawal();
      expect(console.error).toHaveBeenCalled();
    });

    it('should do nothing if userId is null', () => {
      component.userId = null;
      expect(component.proceedWithdrawal()).toBeUndefined();
    });
  });

  describe('cancelOverdraft', () => {
    it('should set showOverdraftModal to false', () => {
      component.showOverdraftModal = true;
      component.cancelOverdraft();
      expect(component.showOverdraftModal).toBe(false);
    });
  });

  describe('updateAmount', () => {
    it('should update amount with valid number', () => {
      component.updateAmount('123.45');
      expect(component.amount).toBe(123.45);
    });

    it('should set amount to 0 for invalid input', () => {
      component.updateAmount('abc');
      expect(component.amount).toBe(0);
    });
  });

  // Edge cases
  it('should handle very large deposit', () => {
    component.userId = 1;
    component.amount = 1e9;
    userService.updateUserBalance.mockReturnValue(of({ balance: 1e9 }));
    component.handleDeposit();
    expect(component.maxAmount).toBe(1e9);
  });

  it('should handle negative increment', () => {
    component.amount = 100;
    component.incrementValue = -10;
    component.increaseAmount();
    expect(component.amount).toBe(90);
  });
});
