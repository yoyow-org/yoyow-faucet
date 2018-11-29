import base from './base';

class erc20DAO extends base {
    constructor() {
        super();
        this.table = 'erc20';
        this.fields = {
            uid: 'String',
            eth: 'String',
            bindingtime: 'Date'
        };
    }
}

module.exports = erc20DAO;