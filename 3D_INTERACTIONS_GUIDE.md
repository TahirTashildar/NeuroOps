# NeuroOps 3D Dashboard - Advanced Interactions Guide

## Step 7: New Interactive Features

### 🔗 Drag Connections
Create custom visualization connections between any two service nodes.

**How to Use:**
- **Shift + Click & Drag** from one node to another
- **Right-Click & Drag** from one node to another (alternative method)
- Release over a target node to create the connection
- Connection appears as an **orange dashed line**

**Features:**
- Dynamic connections update in real-time as nodes move
- Can create multiple connections
- Connections remain visible until cleared
- Audio feedback on creation

**Keyboard:**
- **X** - Clear all dynamic connections

---

### 💥 Wheel Explode
Expand or contract all nodes radially from the center for deeper analysis.

**How to Use:**
- **Mouse Wheel Scroll Up** - Expand nodes outward
- **Mouse Wheel Scroll Down** - Contract nodes inward
- **E Key** - Toggle manual explode mode (activates then deactivates on next press)

**Features:**
- Smooth scaling animation (0.5x - 2.5x range)
- All node positions expand/contract radially from origin
- Dynamic connections follow nodes during expansion
- Auto-deactivates after 1.5 seconds of wheel inactivity
- Perfect for examining clustered nodes
- Keyboard shortcut available for accessibility

---

### 🔥 Heatmap Visualization
Color-code nodes by their stress level (error rate) for quick health assessment.

**How to Use:**
- **H Key** - Toggle heatmap mode on/off
- Nodes change color based on error rate

**Color Legend:**
- 🟢 **Green** - Healthy (error rate < 5%)
- 🟠 **Orange** - Warning (error rate 5-15%)
- 🟡 **Yellow** - Caution (error rate 15-30%)
- 🔴 **Red** - Critical (error rate > 30%)

**Features:**
- Real-time metric-based coloring
- Emissive glow updates to match health
- Toggle back to normal coloring anytime
- Complements existing metrics display
- Visual identification of problem services at a glance

---

## Complete Keyboard Reference

### New in Step 7
| Key | Action | Audio |
|-----|--------|-------|
| **H** | Toggle Heatmap Mode | 1000 Hz tone |
| **E** | Activate/Deactivate Wheel Explode | 1200 Hz tone |
| **X** | Clear All Dynamic Connections | 500 Hz tone |
| **Shift+Drag** | Create Connection | 600-800 Hz sweep |

### Previous Features
| Key | Action |
|-----|--------|
| **R** | Reset View |
| **D** | Toggle Dependencies |
| **P** | Toggle Particles |
| **A** | Auto-Rotate Toggle |
| **C** | Cycle Camera Views |
| **I** | Trigger Incident |
| **M** | Toggle Audio |

### Mouse Controls
| Action | Result |
|--------|--------|
| **Mouse Wheel Scroll** | Explode/Contract Nodes |
| **Drag** | Rotate View |
| **Right-Click + Drag** | Create Connection (alternative) |
| **Click Node** | Select & Show Details |
| **Hover Node** | Show Tooltip |

---

## Interaction Tips & Tricks

### Best Practices
1. **Use Heatmap + Dependencies** for comprehensive network analysis
2. **Combine Explode with Dependencies** to see cascading effects clearly
3. **Create custom connections** to document your analysis paths
4. **Use audio toggle (M)** for immersive feedback loops

### Workflow Examples

**Incident Analysis:**
1. Press **I** to trigger incident
2. Press **D** to see dependencies
3. Press **H** to see which services are degraded
4. Use **Shift+Drag** to document the incident chain
5. Press **E** to expand and visualize the explosion radius

**Performance Investigation:**
1. Press **H** to enable heatmap
2. Look for red/yellow nodes
3. Select affected nodes to view metrics
4. Press **E** to expand for clearer visibility
5. Use **Shift+Drag** to create analysis connections

**Network Mapping:**
1. Select a critical service
2. Press **D** to show dependencies
3. Use **Shift+Drag** to create custom connection paths
4. Use camera views (**C**) to get different angles
5. Enable heatmap (**H**) to show service health

---

## Technical Details

### Interaction States
- `isDraggingConnection` - Active during connection drag
- `wheelExplodeActive` - Active during wheel explode session
- `wheelExplodeScale` - Current expansion scale (0.5-2.5)
- `heatmapMode` - Heatmap visualization toggle state
- `draggableConnections` - Map of user-created connections

### Performance Considerations
- Wheel explode updates all nodes and connections smoothly
- Dynamic connections update in animation loop (no lag)
- Heatmap recoloring is O(n) where n = number of services
- Typical dashboard: 11 services with <1ms overhead per feature

### Audio Feedback
All new interactions include audio cues:
- 600 Hz: Drag start
- 800 Hz: Connection created
- 900 Hz: Wheel explode activated
- 1200 Hz: Manual explode toggle
- 500 Hz: Clear connections

---

## Troubleshooting

**Connections not creating?**
- Ensure you're holding Shift or using Right-Click
- Release the mouse over a different node (not the start node)
- Check browser console for errors

**Explode not working?**
- Try the E key instead of mouse wheel
- Check that not in VR mode
- Look for "Wheel explode ACTIVATED" message in console

**Heatmap not changing colors?**
- Press H to toggle on (should show console message)
- Ensure live data is loaded
- Try switching back to normal mode and re-enabling

---

## Future Enhancements (Step 8+)

Planned for upcoming steps:
- Screenshot/export visualization
- Level-of-Detail (LOD) performance optimization
- Touch/mobile gesture support
- Connection properties editor
- Saved annotation system
