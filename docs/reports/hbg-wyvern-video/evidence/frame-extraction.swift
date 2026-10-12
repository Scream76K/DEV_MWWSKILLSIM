import AVFoundation
import AppKit
let args=CommandLine.arguments
let asset=AVURLAsset(url:URL(fileURLWithPath:args[1]))
let duration=CMTimeGetSeconds(asset.duration)
print("duration",duration)
let gen=AVAssetImageGenerator(asset:asset); gen.appliesPreferredTrackTransform=true
gen.requestedTimeToleranceBefore = .zero; gen.requestedTimeToleranceAfter = .zero
print("fps",asset.tracks(withMediaType:.video).first!.nominalFrameRate)
let step=Double(args[3])!
try! FileManager.default.createDirectory(atPath:args[2],withIntermediateDirectories:true)
for t in stride(from:Double(args[4])!,to:Double(args[5])!,by:step) {
 do { var actual=CMTime.zero; let cg=try gen.copyCGImage(at:CMTime(seconds:t,preferredTimescale:600),actualTime:&actual); let rep=NSBitmapImageRep(cgImage:cg); let data=rep.representation(using:.png,properties:[:])!; try data.write(to:URL(fileURLWithPath:args[2]+String(format:"/%08.4f.png",CMTimeGetSeconds(actual)))) } catch { print(error) }
}
