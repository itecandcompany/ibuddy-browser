Pod::Spec.new do |s|
  s.name           = 'IBuddyOCR'
  s.version        = '1.0.0'
  s.summary        = 'On-device text recognition using Apple Vision'
  s.description    = 'A local Expo module that recognizes text in user-selected images using Apple Vision.'
  s.license        = { :type => 'MIT' }
  s.author         = 'iBuddy'
  s.homepage       = 'https://github.com/itecandcompany/ibuddy-browser'
  s.platforms      = { :ios => '15.1' }
  s.source         = { :git => 'https://github.com/itecandcompany/ibuddy-browser.git', :tag => s.version.to_s }
  s.source_files   = 'ios/**/*.{h,m,mm,swift}'
  s.swift_version  = '5.9'
  s.dependency 'ExpoModulesCore'
end
