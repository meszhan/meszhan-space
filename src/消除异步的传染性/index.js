async function getUser() {
    return await fetch('').then((resp) => resp.json())
}

async function m1() {
    return await getUser();
}

async function m2() {
    return await m1();
}

async function main() {
    return await m2();
}

function run(func) {
    let cache = [];
    let i = 0;
    const originFetch = window.fetch;
    window.fetch = () => {
        // 如果cache中有缓存结果，交付缓存
        if (cache[i]) {
            if (cache[i].status === 'fulfilled') {
                return cache[i]
            }else if (cache[i].status === 'rejected') {
                throw cache[i].err
            }
        }
        const result = {
            // 状态
            status: 'pending',
            data: null,
            err: null
        };
        cache[i++] = result;
        const promise = originFetch().then(() => {
            result.status = 'fulfilled';
            result.data = {data: Math.random()};
        }).catch((err) => {
            result.status = 'rejected';
            result.err = err
        })
        // 抛出错误
        throw promise;
    }
    // 捕获上面抛出的错误
    try {
        func()
    }catch (err) {
        if (err instanceof Promise) {
            const reRun = () => {
                i = 0;
                func();
            }
            err.then(reRun, reRun)
        }
    }
}

run(main)
