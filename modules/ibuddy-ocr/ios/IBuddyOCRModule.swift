import ExpoModulesCore
import UIKit
import Vision
import ImageIO

public final class IBuddyOCRModule: Module {
  public func definition() -> ModuleDefinition {
    Name("IBuddyOCR")

    AsyncFunction("recognizeText") { (base64Image: String) throws -> [String: Any] in
      let cleanedBase64 = base64Image
        .replacingOccurrences(of: "data:image/jpeg;base64,", with: "")
        .replacingOccurrences(of: "data:image/png;base64,", with: "")
      guard let imageData = Data(base64Encoded: cleanedBase64, options: .ignoreUnknownCharacters),
            let image = UIImage(data: imageData),
            let cgImage = image.cgImage else {
        throw NSError(
          domain: "IBuddyOCR",
          code: 1001,
          userInfo: [NSLocalizedDescriptionKey: "The selected file is not a supported image."]
        )
      }

      let request = VNRecognizeTextRequest()
      request.recognitionLevel = .accurate
      request.usesLanguageCorrection = true
      request.minimumTextHeight = 0.004

      let orientation = CGImagePropertyOrientation(image.imageOrientation)
      let handler = VNImageRequestHandler(cgImage: cgImage, orientation: orientation, options: [:])
      try handler.perform([request])

      let lines: [[String: Any]] = (request.results ?? []).compactMap { observation in
        guard let candidate = observation.topCandidates(1).first else { return nil }
        return ["text": candidate.string, "confidence": Double(candidate.confidence)]
      }
      let fullText = lines.compactMap { $0["text"] as? String }.joined(separator: "\n")
      return [
        "text": fullText,
        "lines": lines,
        "engine": "apple-vision",
        "language": request.recognitionLanguages.first ?? "system"
      ]
    }
  }
}
