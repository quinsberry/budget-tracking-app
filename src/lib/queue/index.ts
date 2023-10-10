// Source: https://github.com/Bartozzz/queue-promise

import { EventEmitter } from 'events';

enum State {
    IDLE = 0,
    RUNNING = 1,
    STOPPED = 2,
}

type Options = {
    concurrent: number;
    interval: number;
    start?: boolean;
};

export class Queue extends EventEmitter {
    private uniqueId = 0;
    private lastRan = 0;
    private timeoutId: NodeJS.Timeout;
    private currentlyHandled = 0;

    readonly tasks: Map<number, () => Promise<any>> = new Map();
    state: State = State.IDLE;
    readonly options: Options;

    constructor(options: Options) {
        super();

        this.options = {
            start: true,
            ...options,
        };
    }

    on(event: 'start', listener: () => void): this;
    on(event: 'stop', listener: () => void): this;
    on(event: 'end', listener: () => void): this;
    on(event: 'dequeue', listener: () => void): this;
    on(event: 'resolve', listener: (value: any) => void): this;
    on(event: 'reject', listener: (error: any) => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this {
        return super.on(event, listener);
    }

    /**
     * Starts the queue if it has not been started yet.
     *
     * @emits   start
     * @return  {void}
     * @access  public
     */
    start(): void {
        if (this.state !== State.RUNNING && !this.isEmpty) {
            this.state = State.RUNNING;
            this.emit('start');

            (async () => {
                while (this.shouldRun) {
                    await this.dequeue();
                }
            })();
        }
    }

    /**
     * Forces the queue to stop. New tasks will not be executed automatically even
     * if `options.start` was set to `true`.
     *
     * @emits   stop
     * @return  {void}
     * @access  public
     */
    stop(): void {
        clearTimeout(this.timeoutId);

        this.state = State.STOPPED;
        this.emit('stop');
    }

    /**
     * Goes to the next request and stops the loop if there are no requests left.
     *
     * @emits   end
     * @return  {void}
     * @access  private
     */
    finalize(): void {
        this.currentlyHandled -= 1;

        if (this.currentlyHandled === 0 && this.isEmpty) {
            this.stop();

            // Finalize doesn't force queue to stop as `Queue.stop()` does. Therefore,
            // new tasks should be still resolved automatically if `options.start` was
            // set to `true` (see `Queue.enqueue`):
            this.state = State.IDLE;

            this.emit('end');
        }
    }

    /**
     * Executes _n_ concurrent (based od `options.concurrent`) promises from the
     * queue.
     *
     * @return  {Promise<any>}
     * @emits   resolve
     * @emits   reject
     * @emits   dequeue
     * @access  private
     */
    async execute(): Promise<any> {
        const promises = [];

        this.tasks.forEach((promise, id) => {
            // Maximum amount of parallel tasks:
            if (this.currentlyHandled < this.options.concurrent) {
                this.currentlyHandled++;
                this.tasks.delete(id);

                promises.push(
                    Promise.resolve(promise())
                        .then(value => {
                            this.emit('resolve', value);
                            return value;
                        })
                        .catch(error => {
                            this.emit('reject', error);
                            return error;
                        })
                        .finally(() => {
                            this.emit('dequeue');
                            this.finalize();
                        })
                );
            }
        });

        // Note: Promise.all will reject if any of the concurrent promises fail,
        // regardless if they are all finished yet! This is why we are emitting
        // events per task (and not per batch of tasks with respect to
        // `concurrent`):
        const output = await Promise.all(promises);

        return this.options.concurrent === 1 ? output[0] : output;
    }

    /**
     * Executes _n_ concurrent (based od `options.concurrent`) promises from the
     * queue.
     *
     * @return  {Promise<any>}
     * @emits   resolve
     * @emits   reject
     * @emits   dequeue
     * @access  public
     */
    dequeue(): Promise<any> {
        const { interval } = this.options;

        return new Promise<any>((resolve, reject) => {
            const timeout = Math.max(0, interval - (Date.now() - this.lastRan));

            clearTimeout(this.timeoutId);
            this.timeoutId = setTimeout(() => {
                this.lastRan = Date.now();
                this.execute().then(resolve);
            }, timeout);
        });
    }

    /**
     * Adds tasks to the queue.
     *
     * @param   {Function|Array}  tasks     Tasks to add to the queue
     * @throws  {Error}                     When task is not a function
     * @return  {void}
     * @access  public
     */
    enqueue(tasks: () => Promise<any> | Array<() => Promise<any>>): void {
        if (Array.isArray(tasks)) {
            tasks.map(task => this.enqueue(task));
            return;
        }

        if (typeof tasks !== 'function') {
            throw new Error(`You must provide a function, not ${typeof tasks}.`);
        }

        this.uniqueId = (this.uniqueId + 1) % Number.MAX_SAFE_INTEGER;
        this.tasks.set(this.uniqueId, tasks as () => Promise<any>);

        // Start the queue if the queue should resolve new tasks automatically and
        // hasn't been forced to stop:
        if (this.options.start && this.state !== State.STOPPED) {
            this.start();
        }
    }

    /**
     * @see     enqueue
     * @access  public
     */
    add(tasks: () => Promise<any> | Array<() => Promise<any>>): void {
        this.enqueue(tasks);
    }

    /**
     * Removes all tasks from the queue.
     *
     * @return  {void}
     * @access  public
     */
    clear(): void {
        this.tasks.clear();
    }

    /**
     * Size of the queue.
     *
     * @type    {number}
     * @access  public
     */
    get size(): number {
        return this.tasks.size;
    }

    /**
     * Checks whether the queue is empty, i.e. there's no tasks.
     *
     * @type    {boolean}
     * @access  public
     */
    get isEmpty(): boolean {
        return this.size === 0;
    }

    /**
     * Checks whether the queue is not empty and not stopped.
     *
     * @type    {boolean}
     * @access  public
     */
    get shouldRun(): boolean {
        return !this.isEmpty && this.state !== State.STOPPED;
    }
}
