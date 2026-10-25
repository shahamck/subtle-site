// Traces the raster subtle. logo into a vector SVG (Vision contour detection on a 4x Lanczos
// upscale, then Douglas-Peucker so straight edges collapse to single segments).
// Usage: swift scripts/trace-logo.swift raw/rooms/logo.png public/brand/subtle.svg
import AppKit
import CoreImage
import Vision

let args = CommandLine.arguments
guard args.count >= 3, var ci = CIImage(contentsOf: URL(fileURLWithPath: args[1])) else {
    print("usage: trace-logo in.png out.svg"); exit(1)
}
let scale: CGFloat = 4
let src = ci.extent
ci = ci.applyingFilter("CILanczosScaleTransform", parameters: [kCIInputScaleKey: scale, kCIInputAspectRatioKey: 1])
// flatten onto white so the transparent background reads as light
let white = CIImage(color: .white).cropped(to: ci.extent)
ci = ci.composited(over: white)

let req = VNDetectContoursRequest()
req.detectsDarkOnLight = true
req.contrastAdjustment = 1.0
req.maximumImageDimension = Int(max(ci.extent.width, ci.extent.height))
try VNImageRequestHandler(ciImage: ci).perform([req])
guard let obs = req.results?.first else { print("no contours"); exit(2) }

let W = src.width, H = src.height

func simplify(_ pts: [CGPoint], _ eps: CGFloat) -> [CGPoint] {
    guard pts.count > 2 else { return pts }
    var keep = [Bool](repeating: false, count: pts.count)
    keep[0] = true; keep[pts.count - 1] = true
    var stack = [(0, pts.count - 1)]
    while let (a, b) = stack.popLast() {
        let p = pts[a], q = pts[b]
        let dx = q.x - p.x, dy = q.y - p.y, len = max(hypot(dx, dy), 1e-9)
        var best: CGFloat = 0, idx = -1
        for i in (a + 1)..<b where b - a > 1 {
            let d = abs(dy * pts[i].x - dx * pts[i].y + q.x * p.y - q.y * p.x) / len
            if d > best { best = d; idx = i }
        }
        if best > eps, idx > 0 { keep[idx] = true; stack.append((a, idx)); stack.append((idx, b)) }
    }
    return zip(pts, keep).filter { $0.1 }.map { $0.0 }
}

var d = ""
func emit(_ c: VNContour) {
    let pts = c.normalizedPoints.map { CGPoint(x: CGFloat($0.x) * W, y: (1 - CGFloat($0.y)) * H) }
    let s = simplify(pts, 0.12)
    if s.count > 2 {
        d += "M" + s.map { String(format: "%.2f %.2f", $0.x, $0.y) }.joined(separator: "L") + "Z"
    }
    for child in c.childContours { emit(child) }
}
for c in obs.topLevelContours { emit(c) }

let svg = """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 \(Int(W)) \(Int(H))"><path fill="currentColor" fill-rule="evenodd" d="\(d)"/></svg>
"""
try svg.write(toFile: args[2], atomically: true, encoding: .utf8)
print("wrote \(args[2]) — \(d.count) chars, \(obs.contourCount) contours")
