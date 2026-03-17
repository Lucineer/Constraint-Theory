# Quick Start Guide - New Simulators

## Calculus Visualization Simulator

### Access
**URL:** https://constraint-theory.superinstance.ai/simulators/calculus/

### Differentiation Tab
**Explore how functions change at any point**

1. **Select a function** from the dropdown:
   - `f(x) = x²` - Basic parabola
   - `f(x) = x³` - Cubic function
   - `f(x) = sin(x)` - Sine wave
   - `f(x) = eˣ` - Exponential growth
   - `f(x) = ln(x)` - Natural logarithm
   - Custom - Enter your own function

2. **Move your mouse** over the graph to see:
   - **Yellow line**: Tangent (instantaneous rate of change)
   - **Green line**: Secant approximation (average rate)
   - **Cyan curve**: Original function

3. **Adjust controls**:
   - **X Range**: Expand/contract viewing area
   - **Resolution**: Increase point density (50-500)
   - **Show Tangent**: Toggle tangent line display
   - **Show Secant**: Toggle secant approximation

4. **Read statistics**:
   - Point (x) where mouse is located
   - f(x) - function value
   - f'(x) - derivative value
   - f''(x) - second derivative

### Integration Tab
**Compare numerical integration methods**

1. **Select a function** to integrate:
   - `f(x) = x²` - Parabola (area under curve)
   - `f(x) = sin(x)` - Sine wave
   - `f(x) = eˣ` - Exponential

2. **Set integration bounds**:
   - **Lower Bound**: Start point (adjust slider)
   - **Upper Bound**: End point (adjust slider)

3. **Choose method**:
   - **Simpson's Rule**: Most accurate (O(h⁴))
   - **Trapezoidal Rule**: Medium accuracy (O(h²))
   - **Riemann Sum**: Least accurate (O(h))

4. **Adjust segments** (n):
   - More segments = more accuracy
   - Range: 2 to 50 segments

5. **Compare results**:
   - Calculated: Numerical approximation
   - Exact: True mathematical value
   - Error: Absolute difference
   - Error %: Percentage accuracy

### Gradient Field Tab
**Visualize 3D gradient vectors**

1. **Select surface** type:
   - **Saddle**: z = x² - y² (mountain pass)
   - **Bowl**: z = x² + y² (minimum at origin)
   - **Wave**: z = sin(x) × cos(y) (oscillating)
   - **Pyramid**: z = |x| + |y| (pointed peak)

2. **Adjust visualization**:
   - **Field Density**: Number of gradient vectors (5-20)
   - **Show Surface**: Toggle 3D surface mesh
   - **Show Vectors**: Toggle gradient arrows
   - **Animate Gradient**: Auto-rotate camera

3. **Interact with 3D view**:
   - **Click and drag** to rotate camera
   - Observe gradient directions:
     - Arrows point uphill (steepest ascent)
     - Longer arrows = steeper slope
     - Color indicates magnitude

---

## 4D Rigidity Visualization

### Access
**URL:** https://constraint-theory.superinstance.ai/simulators/rigidity-4d/

### Understanding 4D Structures

**What is 4D rigidity?**
- In 4D space, a structure is rigid if it can't deform without breaking edges
- **Constraint formula**: E ≥ 4V - 10
  - E = number of edges
  - V = number of vertices
  - 4V - 10 = minimum edges needed for rigidity

### Structure Types

#### 1. 4D Simplex (5 vertices)
- **Simplest 4D rigid structure**
- Complete graph: every vertex connects to every other
- 10 edges total
- **Status**: Always rigid

#### 2. 4D Hypercube (16 vertices)
- **4D analog of a cube (tesseract)**
- Vertices at (±1, ±1, ±1, ±1)
- 32 edges connecting vertices differing in one coordinate
- **Status**: Always rigid

#### 3. 16-Cell (8 vertices)
- **Dual of hypercube**
- Vertices on 4D axes: (±1,0,0,0), (0,±1,0,0), etc.
- 24 edges connecting orthogonal vertices
- **Status**: Always rigid

#### 4. 24-Cell (24 vertices)
- **Self-dual regular polytope**
- Unique structure exists only in 4D
- 96 edges total
- **Status**: Always rigid

#### 5. 120-Cell (60 vertices, simplified)
- **Complex 4D structure**
- Simplified representation (full has 600 vertices)
- Multiple edge connections
- **Status**: Rigid

#### 6. Custom Random
- **Exploratory random structure**
- 10 random vertices in 4D
- Random edge connections
- **Status**: May be rigid or flexible

### Controls

1. **Rotation Speed**:
   - Adjusts how fast 4D rotation animates
   - 0x = stopped, 3x = fast

2. **Projection Distance**:
   - Controls 4D→3D projection
   - Lower = more dramatic perspective
   - Higher = flatter projection

3. **Reset Camera**:
   - Returns camera to default position
   - Use if you get lost in 3D space

4. **Randomize Structure**:
   - Adds small random perturbation to vertices
   - Tests structural stability
   - Useful for custom structures

### Reading Rigidity Analysis

**Vertices (V)**: Number of points
**Edges (E)**: Number of connections
**Degrees of Freedom**: 4V - 10 (minimum edges needed)
**Required Edges**: Same as degrees of freedom
**Redundancy**: E - Required (extra edges beyond minimum)
**Efficiency**: (E / Required) × 100%

**Rigidity Status**:
- **RIGID** (green): E ≥ 4V - 10 ✓
- **FLEXIBLE** (red): E < 4V - 10 ✗

### Understanding Projection

**4D to 3D Projection Formula**:
```
scale = 1 / (distance - w)
x' = x × scale
y' = y × scale
z' = z × scale
```

Where (x, y, z, w) is the 4D point and (x', y', z') is the projected 3D point.

---

## Validation Tests

### Access
**URL:** https://constraint-theory.superinstance.ai/tests/validation/

### Running Tests

1. Click **"Run All Tests"** button
2. Watch results populate in real-time
3. Review pass/fail status for each test

### Test Categories

#### Numerical Differentiation
- ✓ Derivative accuracy for f(x) = x²
- ✓ Trigonometric function derivatives
- ✓ Second derivative computation

#### Numerical Integration
- ✓ Simpson's rule O(h⁴) accuracy
- ✓ Trapezoidal rule O(h²) accuracy
- ✓ Riemann sum O(h) accuracy

#### Gradient Computation
- ✓ Bowl surface gradient
- ✓ Saddle surface gradient

#### Dodecet Encoding
- ✓ 12-bit encoding/decoding
- ✓ Geometric constraint preservation

#### Constraint Satisfaction
- ✓ Pythagorean snapping
- ✓ Nearest triple computation

#### Performance Benchmarks
- ✓ Differentiation speed (< 1ms)
- ✓ Integration efficiency (< 100ms)

### Interpreting Results

**Green (✓)**: Test passed
- Accuracy within tolerance
- Performance meets targets

**Red (✗)**: Test failed
- Error exceeds threshold
- Performance too slow
- Check console for details

**Summary Metrics**:
- **Total**: Number of tests run
- **Passed**: Successful tests
- **Failed**: Failed tests
- **Duration**: Total execution time

---

## Tips and Tricks

### Calculus Simulator
1. **Custom Functions**: Try `Math.sin(x) * x` for damped oscillation
2. **Integration Bounds**: Set lower < upper or get negative area
3. **Gradient Density**: Higher density = more vectors but slower
4. **Mouse Tracking**: Hover over differentiation graph for real-time derivatives

### 4D Rigidity
1. **Start Simple**: Begin with 4D Simplex to understand projection
2. **Slow Down**: Reduce rotation speed to see 4D motion clearly
3. **Custom Structures**: Use randomize to test structural stability
4. **Camera Reset**: If lost, click "Reset Camera" to reorient

### Validation
1. **Run Multiple Times**: Ensure consistent results
2. **Check Performance**: Verify execution time is acceptable
3. **Review Research**: Reference PDF reports for test methodology

---

## Common Issues

### Issue: Calculus graphs look distorted
**Solution**: Adjust X Range to zoom in/out on area of interest

### Issue: 4D structure looks flat
**Solution**: Decrease Projection Distance for more dramatic perspective

### Issue: Integration error is high
**Solution**: Increase number of segments or switch to Simpson's Rule

### Issue: Gradient vectors too dense
**Solution**: Decrease Field Density slider value

### Issue: Tests fail consistently
**Solution**: Check browser console for error messages

---

## Browser Compatibility

**Recommended Browsers**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required Features**:
- JavaScript ES6+
- WebGL (for 3D rendering)
- Canvas API (for 2D graphs)

---

## Performance Tips

1. **Close Other Tabs**: Free up memory for smooth animations
2. **Reduce Segments**: Lower integration segments for faster computation
3. **Lower Density**: Fewer gradient vectors improves 3D performance
4. **Disable Animation**: Turn off gradient animation if laggy

---

## Getting Help

**Documentation**:
- Main Site: https://constraint-theory.superinstance.ai
- GitHub: https://github.com/SuperInstance/constrainttheory

**Research Papers**:
- Located in repository root
- PDF format with mathematical foundations
- Validation criteria and test methodology

**Issues**:
- Report bugs on GitHub Issues
- Include browser version and error messages
- Screenshot if visual issue

---

**Last Updated**: 2026-03-17
**Version**: Round 5
**Status**: Production Ready
