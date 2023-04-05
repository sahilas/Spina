import { Controller } from "@hotwired/stimulus"
import hljs from "../libraries/highlight@10.5.0"

export default class extends Controller {
  
  connect() {
    this.element.querySelectorAll('pre').forEach(function(pre) {
      hljs.highlightBlock(pre)
    })
  }
  
}
