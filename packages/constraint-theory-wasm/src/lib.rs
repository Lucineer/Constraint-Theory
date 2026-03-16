use wasm_bindgen::prelude::*;

// Import the `console.log` from the browser
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

// Export a greeting function
#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to Constraint Theory.", name)
}

// Pythagorean snapping function
#[wasm_bindgen]
pub fn snap_to_pythagorean(x: f64, y: f64, threshold: f64) -> JsValue {
    let ratios = vec![
        (3.0, 4.0, 5.0),
        (5.0, 12.0, 13.0),
        (8.0, 15.0, 17.0),
        (7.0, 24.0, 25.0),
    ];

    for (a, b, c) in ratios {
        let distance = ((x - a).powi(2) + (y - b).powi(2)).sqrt();
        if distance < threshold {
            let result = serde_json::json!({
                "original": {"x": x, "y": y},
                "snapped": {"x": a, "y": b},
                "ratio": {"a": a, "b": b, "c": c},
                "distance": distance
            });
            return JsValue::from_serde(&result).unwrap();
        }
    }

    let result = serde_json::json!({
        "original": {"x": x, "y": y},
        "snapped": null,
        "distance": 0.0
    });
    JsValue::from_serde(&result).unwrap()
}

// Rigidity check using Laman's theorem
#[wasm_bindgen]
pub fn check_rigidity(nodes: usize, edges: usize) -> bool {
    // Laman's theorem: A graph is generically rigid in 2D if and only if
    // it has exactly 2n - 3 edges and every subgraph with n' nodes has at most 2n' - 3 edges
    edges == 2 * nodes - 3
}

// Initialize the WASM module
#[wasm_bindgen(start)]
pub fn init() {
    console_error_panic_hook::set_once();
    log("Constraint Theory WASM initialized");
}
