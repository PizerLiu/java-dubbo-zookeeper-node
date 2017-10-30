const expire = 60 * 10;
function bucket() {
    let data = new Map();
    this.metafunc = {
        set: function (key, value) {
            return data.set(key, value);
        },
        get: function (key) {
            return data.get(key);
        },
        del: function (key) {
            return data.delete(key);
        },
        has: function (key) {
            return data.has(key);
        },
        data: function () {
            return data;
        }
    };
};
bucket.prototype.data = function () {
    return this.metafunc.data();
};
bucket.prototype.has = function (key) {
    return this.metafunc.has(key);
};
bucket.prototype.get = function (key) {
    return this.metafunc.get(key);
};
bucket.prototype.isExpire = function (key) {
    return this.has(key) ? this.get(key).expire < Date.now() : true;
};
bucket.prototype.count = function (key, change) {
    if (this.has(key)) {
        let data = this.get(key);
        if (change !== 0) {
            data.count += change;
        }
        return data.count;
    }
    else {
        return 0;
    }
};
bucket.prototype.set = function (key) {
    if (this.isExpire(key)) {
        const count = this.count(key, 0);
        this.metafunc.set(key, {
            count: count,
            expire: Date.now() + expire * 1000
        });
        return true;
    }
    else {
        this.count(key, 1);
        return false;
    }
};



module.exports = new bucket();
