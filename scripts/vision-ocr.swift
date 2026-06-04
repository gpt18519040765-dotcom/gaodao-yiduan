import Foundation
import Vision
import ImageIO

struct OCRLine: Codable {
    let text: String
    let confidence: Float
    let x: Double
    let y: Double
    let width: Double
    let height: Double
}

struct OCRPage: Codable {
    let imagePath: String
    let lines: [OCRLine]
}

func loadCGImage(path: String) -> CGImage? {
    let url = URL(fileURLWithPath: path)
    guard let source = CGImageSourceCreateWithURL(url as CFURL, nil) else {
        return nil
    }
    return CGImageSourceCreateImageAtIndex(source, 0, nil)
}

let encoder = JSONEncoder()
encoder.outputFormatting = [.withoutEscapingSlashes]

for imagePath in CommandLine.arguments.dropFirst() {
    guard let image = loadCGImage(path: imagePath) else {
        FileHandle.standardError.write("Cannot load image: \(imagePath)\n".data(using: .utf8)!)
        continue
    }

    let request = VNRecognizeTextRequest()
    request.recognitionLevel = .accurate
    request.usesLanguageCorrection = true
    request.recognitionLanguages = ["zh-Hans", "zh-Hant", "ja-JP", "en-US"]

    let handler = VNImageRequestHandler(cgImage: image, options: [:])
    do {
        try handler.perform([request])
    } catch {
        FileHandle.standardError.write("OCR failed: \(imagePath) \(error)\n".data(using: .utf8)!)
        continue
    }

    let observations = (request.results ?? []).compactMap { observation -> OCRLine? in
        guard let candidate = observation.topCandidates(1).first else { return nil }
        let box = observation.boundingBox
        return OCRLine(
            text: candidate.string,
            confidence: candidate.confidence,
            x: box.origin.x,
            y: box.origin.y,
            width: box.size.width,
            height: box.size.height
        )
    }
    .sorted { left, right in
        let lineDelta = abs(left.y - right.y)
        if lineDelta > 0.01 {
            return left.y > right.y
        }
        return left.x < right.x
    }

    let page = OCRPage(imagePath: imagePath, lines: observations)
    if let data = try? encoder.encode(page), let json = String(data: data, encoding: .utf8) {
        print(json)
    }
}
