import { extractPageHighlights } from "./highlight-extractor";
import type { PageSnapshot } from "@/extraction/page-extractor";

const sample: PageSnapshot = {
 type:"IBUDDY_PAGE_SNAPSHOT",requestId:"test",url:"https://example.com",title:"Renewable energy",
 headings:["Solar energy and renewable power"],
 paragraphs:["Solar energy converts sunlight into electricity. Renewable energy reduces emissions. Solar panels use photovoltaic cells."],
 formLabels:[],links:[],limitations:[]
};

describe("extractPageHighlights",()=>{
 it("ranks meaningful repeated terms and returns source excerpts",()=>{
  const result=extractPageHighlights(sample);
  expect(result.length).toBeGreaterThan(0);
  expect(result.some(item=>item.term==="solar")).toBe(true);
  expect(result.every(item=>item.excerpt.length>0)).toBe(true);
 });
 it("returns no highlights for an empty snapshot",()=>{
  expect(extractPageHighlights({...sample,headings:[],paragraphs:[]})).toEqual([]);
 });
});
