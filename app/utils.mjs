/**
 * Creates a throttled function that only invokes `functionToThrottle` at most once per every `frequencyMs`.
 * Example 1: Avoid excessively updating the position while scrolling.
 *     window.on('scroll', throttle(updatePosition, 100))
 * Example 2: Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
 *     element.on('click', throttle(renewToken, 300000))
 *
 * @param {Function} functionToThrottle The function to throttle.
 * @param {number} frequencyMs The number of milliseconds to throttle invocations to.
 * @returns {Function} Returns the new, throttled function.
 */
export function throttle(functionToThrottle, frequencyMs) {
    let lastTimeCalled = new Date();
    return () => {
        const now = new Date();
        if (now - lastTimeCalled >= frequencyMs) {
            functionToThrottle();
            lastTimeCalled = now;
        }
    };
}