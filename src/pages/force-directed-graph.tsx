import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import * as d3 from 'd3'
import {convertCsv, parseCsvString} from "../utils/csv-utils";
import {Simulation} from "d3";
import {SimulationNodeDatum, SimulationLinkDatum} from "d3-force"

const exampleValues = "source,target,value\nfoo,thud,5\nbar,foo,10\nfoobar,bar,15\nbaz,foobar,20\nqux,baz,15\nquux,qux,10\ncorge,quux,5\ngrault,corge,10\ngarply,grault,15\nwaldo,garply,20\nfred,thud,15\nplugh,fred,10\nxyzzy,plugh,5\nthud,xyzzy,10\ncorge,fred,5";

type State = {
  ignoreFirstRow: boolean,
  values: string;
  separator: string;
  quote: string;
  svgWidth: number;
  svgHeight: number;
  radiusBias: number;
};

type NodeDatum = {
  id: string,
  group: number,
  value: number,
} & SimulationNodeDatum;

type LinkDatum = {
  value: number,
} & SimulationLinkDatum<NodeDatum>;

type CalcFunction = "sum" | "min" | "max";

export default () => {
  const [ state, dispatchState ] = useState({
    ignoreFirstRow: true,
    values: exampleValues,
    markedTable: undefined,
    showOnlyDiff: false,
    separator: ",",
    quote: '"',
    svgWidth: 600,
    svgHeight: 600,
    radiusBias: 40
  } as State);

  const onChangeIgnoreFirstRow = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatchState({
      ...state,
      ignoreFirstRow: e.target.checked
    });
  };
  const onChangeSeparator = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatchState({
      ...state,
      separator: e.target.value,
      values: convertCsv(state.values, state.separator, state.quote, e.target.value, state.quote),
    });
  };
  const onChangeQuote = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatchState({
      ...state,
      quote: e.target.value,
      values: convertCsv(state.values, state.separator, state.quote, e.target.value, state.quote),
    });
  };
  const onChangeValuesText = (e: React.ChangeEvent<HTMLTextAreaElement>) => { dispatchState({ ...state, values: e.target.value }); };

  useEffect(() => {
    const parentRect: DOMRect = (d3.select("#parent_svg").node() as any).getBoundingClientRect();
    const svg = d3.select("#my_svg");
    console.log(parentRect);
    if (parentRect) {
      svg.attr("viewBox", [0, 0, parentRect.width, parentRect.height].join(','));
    }
    dispatchState({
      ...state,
      svgWidth: parentRect.width,
      svgHeight: parentRect.height
    });
  }, []);

  const onClickDraw = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const data = parseInputValues(state.values, state.separator, state.quote, state.ignoreFirstRow, "sum", "sum");

    const simulation = d3.forceSimulation<NodeDatum, LinkDatum>(data.nodes)
      .force("link", d3.forceLink<NodeDatum, LinkDatum>(data.links).id(d => d.id))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(state.svgWidth / 2, state.svgHeight / 2));

    const svg = d3.select("#my_svg");
    d3.selectAll("svg > *").remove();

    const zoomed = function() {
      svg.attr("transform", d3.event.transform);
    };

    svg.call(d3.zoom<any, any>()
      .scaleExtent([1 / 2, 12])
      .on("zoom", zoomed));

    const svgRoot = svg.append("g");
    const links = svgRoot
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", d => Math.sqrt(d.value));

    const nodes = svgRoot
      .selectAll("circle")
      .data(data.nodes)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .join("g");
    const circles = nodes.append("circle")
      .attr("r", d => state.radiusBias + Math.sqrt(d.value))
      .attr("fill", createColorCallback())
      .call(createDragCallback(simulation))
    ;
    const texts = nodes.append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .text(d => d.id);

    simulation.on("tick", () => {
      links
        .attr("x1", d => (d.source as any).x)
        .attr("y1", d => (d.source as any).y)
        .attr("x2", d => (d.target as any).x)
        .attr("y2", d => (d.target as any).y);
      circles
        .attr("cx", d => d.x ?? 0)
        .attr("cy", d => d.y ?? 0);
      texts
        .attr("x", d => d.x ?? 0)
        .attr("y", d => d.y ?? 0);
    });
  };

  return <Root>
    <LeftPanel>
      <div>
        <input type="checkbox" name={"ignoreFirstRow"} onChange={onChangeIgnoreFirstRow} checked={state.ignoreFirstRow} />
        <label htmlFor="ignoreFirstRow">Ignore first row (e.g. labels)</label>
      </div>
      <div>
        <label htmlFor="separator">Separator of input:</label>
        <select name={"separator"} defaultValue={state.separator} onChange={onChangeSeparator}>
          <option value={","}>,</option>
          <option value={"\t"}>TAB</option>
        </select>
      </div>
      <div style={{display: "none"}}> {/* Not supported yet */}
        <label htmlFor="quote">Quote:</label>
        <select defaultValue={state.quote} onChange={onChangeQuote}>
          <option value={'"'}>"</option>
          <option value={"'"}>'</option>
        </select>
      </div>
      <div>
        <ValuesTextArea onChange={onChangeValuesText} value={state.values} />
      </div>
      <ExecButton onClick={onClickDraw}>Draw</ExecButton>
    </LeftPanel>
    <RightPanel id={"parent_svg"}>
      <svg id={"my_svg"} width={state.svgWidth} height={state.svgHeight} style={{background: 'white'}}>
      </svg>
    </RightPanel>
  </Root>;
}

const createDragCallback = (simulation: Simulation<NodeDatum, LinkDatum>) => {
  function dragstarted(d: NodeDatum) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x ?? null;
    d.fy = d.y ?? null;
  }

  function dragged(d: NodeDatum) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d: NodeDatum) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return d3.drag<any, NodeDatum>()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
};

const createColorCallback = () => {
  const scale = d3.scaleOrdinal(d3.schemeCategory10);
  return (d: NodeDatum) => scale(d.group.toString());
};

const parseInputValues = (
  str: string,
  separator: string,
  quote: string,
  ignoreFirstRow: boolean,
  nodeValueCalcFunction: CalcFunction,
  linkValueCalcFunction: CalcFunction
) => {
  let csv = parseCsvString(str, separator, quote);
  if (ignoreFirstRow) {
    csv = csv.slice(1);
  }

  const name2Node = new Map<string, NodeDatum>();
  const source2Target2Link = new Map<string, Map<string, number>>();
  csv.forEach(vs => {
    const sourceId = vs[0];
    const targetId = vs[1];
    const value = parseFloat(vs[2]);
    if (!sourceId || !targetId || isNaN(value)) {
      return;  // Ignore
    }

    // Create Nodes
    let sourceNode = name2Node.get(sourceId);
    let targetNode = name2Node.get(targetId);
    if (!sourceNode) {
      sourceNode = { id: sourceId, group: 0, value: 0 };
      name2Node.set(sourceId, sourceNode);
    }
    if (!targetNode) {
      targetNode = { id: targetId, group: 0, value: 0 };
      name2Node.set(targetId, targetNode);
    }

    // Create Links;
    const target2Link = source2Target2Link.get(sourceId);
    if (!target2Link) {
      const source2Link = source2Target2Link.get(targetId);
      if (!source2Link) {
        source2Target2Link.set(sourceId, new Map<string, number>().set(targetId, value))
      } else {
        source2Link.set(sourceId, value + (source2Link.get(sourceId) ?? 0))
      }
    } else {
      target2Link.set(targetId, value + (target2Link.get(targetId) ?? 0));
    }
  });

  let nodes: NodeDatum[] = Array.from(name2Node.values());
  let links: LinkDatum[] = [];
  source2Target2Link.forEach((target2Link, sourceId) => {
    target2Link.forEach((value, targetId) => {
      const sourceNode = name2Node.get(sourceId);
      const targetNode = name2Node.get(targetId);
      if (sourceNode && targetNode) {
        sourceNode.value += value;
        targetNode.value += value;
        links.push({
          source: sourceNode,
          target: targetNode,
          value: value
        });
      }
    });
  });

  return {
    nodes: nodes,
    links: links
  };
};

const Root = styled.div`
  display: flex;
`;

const LeftPanel = styled.div`
  width: 30%;
  height: 90%;
`;

const RightPanel = styled.div`
  width: 60%;
  height: 90%;
`;

const ValuesTextArea = styled.textarea`
  width: 90%;
  height: 30em;
`;

const ExecButton = styled.button`
  width: 90%;
`;
