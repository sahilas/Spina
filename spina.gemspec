$:.push File.expand_path("lib", __dir__)

# Maintain your gem's version:
require "spina/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |gem|
  gem.name = "spina"
  gem.version = Spina::VERSION

  gem.authors = ["Bram Jetten"]
  gem.email = ["bram@denkgroot.com"]
  gem.homepage = "https://www.spinacms.com"
  gem.summary = "Spina"
  gem.description = "CMS"
  gem.license = "MIT"
  gem.post_install_message = %q{
    Spina v2.14 includes a new migration, don't forget to run spina:install:migrations.
    
    For details on this specific release, refer to the CHANGELOG file.
  }

  gem.required_ruby_version = ">= 2.7.0"

  gem.metadata = {
    "homepage_uri" => "https://www.spinacms.com",
    "bug_tracker_uri" => "https://github.com/SpinaCMS/Spina/issues",
    "documentation_uri" => "https://www.spinacms.com/docs",
    "changelog_uri" => "https://github.com/SpinaCMS/Spina/blob/main/CHANGELOG.md",
    "source_code_uri" => "https://github.com/SpinaCMS/Spina"
  }

  gem.files = Dir["{app,config,db,lib,vendor}/**/*"] + ["Rakefile", "README.md"]

  gem.add_dependency "rails", ">= 7.0"
  gem.add_dependency "propshaft"
  gem.add_dependency "cssbundling-rails"
  gem.add_dependency "pg"
  gem.add_dependency "bcrypt"
  gem.add_dependency "image_processing"
  gem.add_dependency "ancestry"
  gem.add_dependency "breadcrumbs_on_rails"
  gem.add_dependency "kaminari"
  gem.add_dependency "mobility", ">= 1.1.3"
  gem.add_dependency "rack-rewrite", ">= 1.5.0"
  gem.add_dependency "attr_json"
  gem.add_dependency "view_component"
  gem.add_dependency "jsbundling-rails"
  gem.add_dependency "esbuild-rails"
  gem.add_dependency "turbo-rails"
  gem.add_dependency "stimulus-rails"
  gem.add_dependency "babosa"
  gem.add_dependency "jsonapi-serializer"
  gem.add_dependency "browser"
  gem.add_dependency "tailwindcss-rails"
end
