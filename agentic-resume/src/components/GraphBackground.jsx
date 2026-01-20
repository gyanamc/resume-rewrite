import React, { useRef, useEffect, useCallback } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { useResizeDetector } from 'react-resize-detector';

const GraphBackground = ({ data, activeNode, onNodeClick }) => {
    const fgRef = useRef();
    const { width, height, ref } = useResizeDetector();

    useEffect(() => {
        if (fgRef.current) {
            // Config physics
            fgRef.current.d3Force('charge').strength(-200); // Stronger repulsion
            fgRef.current.d3Force('link').distance(70); // Longer links
        }
    }, []);

    useEffect(() => {
        if (activeNode && fgRef.current) {
            // Find node by ID or Name
            const node = data.nodes.find(n => n.id === activeNode || n.name === activeNode);
            if (node) {
                // Aim at node from outside it
                const distance = 80;
                const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

                fgRef.current.cameraPosition(
                    { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
                    node, // lookAt ({ x, y, z })
                    2000  // ms transition duration
                );
            }
        }
    }, [activeNode, data]);

    return (
        <div ref={ref} className="absolute inset-0 z-0 bg-[#0f172a]">
            <ForceGraph3D
                ref={fgRef}
                width={width}
                height={height}
                graphData={data}

                // Node Styling
                nodeLabel="name"
                nodeResolution={16}
                nodeColor={node => node.color}
                nodeVal={node => (node.val || 5) * 0.5} // Reduced size by 3x
                nodeOpacity={0.95}

                // Link Styling
                linkColor={() => '#6366f1'} // Indigo-500
                linkWidth={1}
                linkOpacity={0.3}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={0.005}
                linkDirectionalParticleWidth={2}

                // Environment
                backgroundColor="#0f172a"
                showNavInfo={false}

                onNodeClick={onNodeClick}
            />
        </div>
    );
};

export default GraphBackground;
