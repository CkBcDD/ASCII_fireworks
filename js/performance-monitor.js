/**
 * Performance monitoring utilities
 */

/**
 * Creates a simple FPS and particle count monitor
 * @param {Object} particlePool - ParticlePool instance
 */
export function createPerformanceMonitor(particlePool) {
    // Create monitor element
    const monitor = document.createElement('div');
    monitor.id = 'performance-monitor';
    monitor.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.7);
        color: #0f0;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        padding: 10px;
        border-radius: 5px;
        z-index: 10000;
        min-width: 200px;
        pointer-events: none;
    `;
    document.body.appendChild(monitor);

    let frameCount = 0;
    let lastTime = performance.now();
    let fps = 0;

    function updateMonitor() {
        frameCount++;
        const currentTime = performance.now();
        const elapsed = currentTime - lastTime;

        // Update FPS every second
        if (elapsed >= 1000) {
            fps = Math.round((frameCount * 1000) / elapsed);
            frameCount = 0;
            lastTime = currentTime;
        }

        const stats = particlePool.getStats();

        monitor.innerHTML = `
            <div><strong>Performance Monitor</strong></div>
            <div>FPS: ${fps}</div>
            <div>Active Particles: ${stats.active}</div>
            <div>Pooled Particles: ${stats.pooled}</div>
            <div>Total Objects: ${stats.total}</div>
            <div>Pool Utilization: ${Math.round((stats.active / stats.maxSize) * 100)}%</div>
        `;

        requestAnimationFrame(updateMonitor);
    }

    updateMonitor();

    return monitor;
}

/**
 * Removes the performance monitor
 */
export function removePerformanceMonitor() {
    const monitor = document.getElementById('performance-monitor');
    if (monitor) {
        monitor.remove();
    }
}

/**
 * Toggle performance monitor visibility
 */
export function togglePerformanceMonitor() {
    const monitor = document.getElementById('performance-monitor');
    if (monitor) {
        monitor.style.display = monitor.style.display === 'none' ? 'block' : 'none';
    }
}
