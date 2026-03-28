# NeuroOpus 3D Enhancements TODO
Approved plan: Make 3D site more beautiful/interactive (post-processing, audio, timeline, VR, heatmaps, etc.).

## Progress
- [x] 1. Create TODO.md ✅

## Steps Remaining
- [x] 2. Update index-3d.html (new UI: timeline, buttons, badge, mobile) ✅
- [x] 3. app-3d.js: Post-processing (bloom/FXAA), env maps ✅

Note: Env maps skipped for self-contained (procedural space BG already present); Bloom/FXAA active - expect glowing nodes/sharper edges.
- [x] 4. app-3d.js: Audio system (ambient/SFX) ✅

Ambient hum on load, SFX for keys (M toggle), sine waves Web Audio API.
- [x] 5. app-3d.js: Timeline scrubber for incidents ✅

Slider/playback replays incidents (30s duration), node visuals change, UI live (time/badge). Mock/live API sync.
- [x] 6. app-3d.js: VR/WebXR support ✅

🆚 toggleVR(), controllers raycast/select nodes, immersive-vr session, grip viz. VR button ready (add onclick to HTML if needed).
- [x] 7. app-3d.js: New interactions (drag conn, wheel explode, heatmaps) ✅

✨ **COMPLETED - Step 7 Features**:
- **Drag Connections**: Shift+Drag or Right-Click+Drag to draw temporary connections between nodes
- **Wheel Explode**: Mouse wheel scroll to expand/contract all nodes from origin (E key via keyboard)
- **Heatmaps**: H key to toggle stress visualization (color nodes by error rate)
- **Dynamic Connection Management**: Created connections labeled with orange dashed lines
- **Keyboard Shortcuts**: H=Heatmap, E=Explode, X=Clear connections

- [ ] 8. app-3d.js: Screenshot export, LOD perf
- [ ] 9. Test all (keyboard/touch/API/VR/mobile)
- [ ] 10. Update TODO ✅ → attempt_completion

**Next**: Step 8 - app-3d.js: Screenshot export & LOD performance optimization
