import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import * as d3 from 'd3'
import {convertCsv, parseCsvString} from "../utils/csv-utils";
import {Simulation} from "d3";
import {SimulationNodeDatum, SimulationLinkDatum} from "d3-force"
import {hashcode} from "../utils/global-functions";

const exampleValues = "source\ttarget\tvalue\nfoo\tthud\t5\nbar\tfoo\t10\nfoobar\tbar\t15\nbaz\tfoobar\t20\nqux\tbaz\t15\nquux\tqux\t10\ncorge\tquux\t5\ngrault\tcorge\t10\ngarply\tgrault\t15\nwaldo\tgarply\t20\nfred\tthud\t15\nplugh\tfred\t10\nxyzzy\tplugh\t5\nthud\txyzzy\t10\ncorge\tfred\t5";

type State = {
  ignoreFirstRow: boolean,
  values: string;
  separator: string;
  quote: string;
  svgWidth: number;
  svgHeight: number;
  radiusBias: number;
  radiusFactor: number;
  linkLengthBias: number;
  linkLengthFactor: number;
  linkWidthBias: number;
  linkWidthFactor: number;
  linkStrengthBias: number;
  linkStrengthFactor: number;
  fontSize: number;
  aggregateFunctionForNode: AggregateFunction,
  simulation?: Simulation<NodeDatum, LinkDatum>;
  data: {
    nodes: NodeDatum[],
    links: LinkDatum[]
  }
};

type NodeDatum = {
  id: string,
  group: number,
  value: number,
} & SimulationNodeDatum;

type LinkDatum = {
  value: number,
} & SimulationLinkDatum<NodeDatum>;

type AggregateFunction = "sum" | "count" | "min" | "max" | "none";

export default () => {
  const [ state, dispatchState ] = useState({
    ignoreFirstRow: true,
    values: exampleValues,
    markedTable: undefined,
    showOnlyDiff: false,
    separator: "\t",
    quote: '"',
    svgWidth: 600,
    svgHeight: 600,
    radiusBias: 20,
    radiusFactor: 0,
    linkLengthBias: 20,
    linkLengthFactor: 0,
    linkWidthBias: 2,
    linkWidthFactor: 0,
    linkStrengthBias: 1,
    linkStrengthFactor: 0,
    fontSize: 10,
    aggregateFunctionForNode: "sum",
    simulation: undefined,
    data: { nodes: [], links: [] }
  } as State);

  const onChangeIgnoreFirstRow = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatchState({
      ...state,
      ignoreFirstRow: e.target.checked
    });
  };

  const onChangeFontSize = createCallback(state, dispatchState, (e) => {
    const fontSize = parseFloat(e.target.value);
    return (fontSize > 0 && !isNaN(fontSize)) ? {fontSize: fontSize} : undefined;
  });
  const onChangeRadiusBias = createCallback(state, dispatchState, (e) => {
    const radiusBias = parseFloat(e.target.value);
    return (!isNaN(radiusBias)) ? {radiusBias: radiusBias} : undefined;
  });
  const onChangeRadiusFactor = createCallback(state, dispatchState, (e) => {
    const radiusFactor = parseFloat(e.target.value);
    return (!isNaN(radiusFactor)) ? {radiusFactor: radiusFactor} : undefined;
  });
  const onChangeLinkLengthBias = createCallback(state, dispatchState, (e) => {
    const linkLengthBias = parseFloat(e.target.value);
    return (!isNaN(linkLengthBias)) ? {linkLengthBias: linkLengthBias} : undefined;
  });
  const onChangeLinkLengthFactor = createCallback(state, dispatchState, (e) => {
    const linkLengthFactor = parseFloat(e.target.value);
    return (!isNaN(linkLengthFactor)) ? {linkLengthFactor: linkLengthFactor} : undefined;
  });
  const onChangeLinkWidthBias = createCallback(state, dispatchState, (e) => {
    const linkWidthBias = parseFloat(e.target.value);
    return (!isNaN(linkWidthBias)) ? {linkWidthBias: linkWidthBias} : undefined;
  });
  const onChangeLinkWidthFactor = createCallback(state, dispatchState, (e) => {
    const linkWidthFactor = parseFloat(e.target.value);
    return (!isNaN(linkWidthFactor)) ? {linkWidthFactor: linkWidthFactor} : undefined;
  });
  const onChangeLinkStrengthBias = createCallback(state, dispatchState, (e) => {
    const linkStrengthBias = parseFloat(e.target.value);
    return (!isNaN(linkStrengthBias)) ? {linkStrengthBias: linkStrengthBias} : undefined;
  });
  const onChangeLinkStrengthFactor = createCallback(state, dispatchState, (e) => {
    const linkStrengthFactor = parseFloat(e.target.value);
    return (!isNaN(linkStrengthFactor)) ? {linkStrengthFactor: linkStrengthFactor} : undefined;
  });
  const onChangeAggregateFunctionForNode = createCallback(state, dispatchState, (e) => {
    return {aggregateFunctionForNode: e.target.value as AggregateFunction};
  });
  const onChangeSeparator = createCallback(state, dispatchState, (e) => {
    return {
      separator: e.target.value,
      values: convertCsv(state.values, state.separator, state.quote, e.target.value, state.quote),
    };
  });
  const onChangeQuote = createCallback(state, dispatchState, (e) => {
    return {
      quote: e.target.value,
      values: convertCsv(state.values, state.separator, state.quote, e.target.value, state.quote),
    };
  });
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

  useEffect(() => {
    d3.selectAll<any, NodeDatum>(".node > circle").attr("r", calcRadiusFunction(state.radiusBias, state.radiusFactor));
  }, [state.radiusBias, state.radiusFactor]);

  useEffect(() => {
    d3.selectAll<any, NodeDatum>(".node > circle").attr("r", calcRadiusFunction(state.radiusBias, state.radiusFactor));
    state.simulation?.force(
      "force-link",
      d3.forceLink<NodeDatum, LinkDatum>(state.data.links)
        .distance(calcDistanceFunction(state.radiusBias, state.radiusFactor, state.linkLengthBias, state.linkLengthFactor))
        .strength(calcStrengthFunction(state.linkStrengthBias, state.linkStrengthFactor))
    );
    state.simulation?.alpha(0.5).restart();
  }, [state.radiusBias, state.radiusFactor, state.linkLengthBias, state.linkLengthFactor, state.linkStrengthBias, state.linkStrengthFactor]);

  useEffect(() => {
    d3.selectAll(".node > text").attr("font-size", state.fontSize + "pt");
  }, [state.fontSize]);

  useEffect(() => {
    d3.selectAll<any, LinkDatum>(".link").attr("stroke-width", calcLinkWidthFunction(state.linkWidthBias, state.linkWidthFactor));
  }, [state.linkWidthBias, state.linkWidthFactor]);

  const onClickDraw = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const data = parseInputValues(state.values, state.separator, state.quote, state.ignoreFirstRow, state.aggregateFunctionForNode);
    data.nodes.forEach(n => { resetPosition(n, state.svgWidth, state.svgHeight); });

    const simulation = d3.forceSimulation<NodeDatum, LinkDatum>(data.nodes)
      .force("force-link",
        d3.forceLink<NodeDatum, LinkDatum>(data.links)
          .distance(calcDistanceFunction(state.radiusBias, state.radiusFactor, state.linkLengthBias, state.linkLengthFactor))
          .strength(calcStrengthFunction(state.linkStrengthBias, state.linkStrengthFactor))
      )
      .force("force-charge", d3.forceManyBody<NodeDatum>())
      .force("force-center", d3.forceCenter<NodeDatum>(state.svgWidth / 2, state.svgHeight / 2));

    const svg = d3.select("#my_svg");
    d3.selectAll("svg > *").remove();

    const svgRoot = svg.append("g");
    const links = svgRoot
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("class", "link")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", calcLinkWidthFunction(state.linkWidthBias, state.linkWidthFactor));

    const nodes = svgRoot
      .selectAll("circle")
      .data(data.nodes)
      .join("g")
      .attr("class", "node");

    const circles = nodes.append("circle")
      .attr("r", calcRadiusFunction(state.radiusBias, state.radiusFactor))
      .attr("fill", createColorFunction)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .call(createDragCallback(simulation))
    ;
    const texts = nodes.append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("cursor", "default")
      .attr("user-select", "none")
      .attr("font-size", state.fontSize + "pt")
      .text(d => d.id)
      .call(createDragCallback(simulation))

    const zoomed = function() {
      svgRoot.attr("transform", d3.event.transform);
    };

    svg.call(d3.zoom<any, any>()
      .scaleExtent([1 / 12, 12])
      .on("zoom", zoomed));

    simulation.on("tick", () => {
      data.nodes.forEach(node => {
        node.x = Math.max(-10000, Math.min(node.x ?? 0, 10000));
        node.y = Math.max(-10000, Math.min(node.y ?? 0, 10000));
      });
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
    dispatchState({
      ...state,
      simulation: simulation,
      data: data
    })
  };

  return <Root>
    <LeftPanel>
      <h2>Import option</h2>
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
        <label htmlFor="aggregateFunctionForNode">Aggregate function for node</label>
        <select name={"aggregateFunctionForNode"} onChange={onChangeAggregateFunctionForNode} value={state.aggregateFunctionForNode}>
          <option value={"sum"}>sum</option>
          <option value={"count"}>count</option>
          <option value={"max"}>max</option>
          <option value={"min"}>min</option>
          <option value={"none"}>none</option>
        </select>
      </div>
      <div>
        <ValuesTextArea onChange={onChangeValuesText} value={state.values} />
      </div>
      <h2>Graph option</h2>
      <div>
        <label htmlFor="ignoreFirstRow">Ignore first row (e.g. labels)</label>
        <input type="checkbox" name={"ignoreFirstRow"} onChange={onChangeIgnoreFirstRow} checked={state.ignoreFirstRow} />
      </div>
      <div>
        <label htmlFor="fontSize">Font size</label>
        <NumberInput type="number" name={"fontSize"} onChange={onChangeFontSize} value={state.fontSize} />
      </div>
      <div>
        <label htmlFor="radiusBias">Radius bias</label>
        <NumberInput type="number" name={"radiusBias"} onChange={onChangeRadiusBias} value={state.radiusBias} />
      </div>
      <div>
        <label htmlFor="radiusFactor">Radius factor</label>
        <NumberInput type="number" name={"radiusFactor"} onChange={onChangeRadiusFactor} value={state.radiusFactor} />
      </div>
      <div>
        <label htmlFor="linkLengthBias">Link length bias</label>
        <NumberInput type="number" name={"linkLengthBias"} onChange={onChangeLinkLengthBias} value={state.linkLengthBias} />
      </div>
      <div>
        <label htmlFor="linkLengthFactor">Link length factor</label>
        <NumberInput type="number" name={"linkLengthFactor"} onChange={onChangeLinkLengthFactor} value={state.linkLengthFactor} />
      </div>
      <div>
        <label htmlFor="linkWidthBias">Link width bias</label>
        <NumberInput type="number" name={"linkWidthBias"} onChange={onChangeLinkWidthBias} value={state.linkWidthBias} />
      </div>
      <div>
        <label htmlFor="linkWidthFactor">Link width factor</label>
        <NumberInput type="number" name={"linkWidthFactor"} onChange={onChangeLinkWidthFactor} value={state.linkWidthFactor} />
      </div>
      <div>
        <label htmlFor="linkStrengthBias">Link strength bias</label>
        <NumberInput type="number" name={"linkStrengthBias"} onChange={onChangeLinkStrengthBias} value={state.linkStrengthBias} />
      </div>
      <div>
        <label htmlFor="linkStrengthFactor">Link strength factor</label>
        <NumberInput type="number" name={"linkStrengthFactor"} onChange={onChangeLinkStrengthFactor} value={state.linkStrengthFactor} />
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

const createColorFunction = (d: NodeDatum) => {
  let hex = Math.abs(hashcode(d.id)).toString(16);
  if (hex.length > 6) {
    hex = hex.slice(hex.length - 6, hex.length);
  } else if (hex.length < 6) {
    hex = "000000".slice(0, 6 - hex.length) + hex;
  }
  return "#" + hex + "3f";
};

const parseInputValues = (
  str: string,
  separator: string,
  quote: string,
  ignoreFirstRow: boolean,
  aggregateFunctionForNode: AggregateFunction
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
        if (aggregateFunctionForNode === "sum") {
          sourceNode.value += value;
          targetNode.value += value;
        } else if (aggregateFunctionForNode === "count") {
          sourceNode.value += 1;
          targetNode.value += 1;
        } else if (aggregateFunctionForNode === "max") {
          sourceNode.value = Math.max(value, sourceNode.value);
          targetNode.value = Math.max(value, targetNode.value);
        } else if (aggregateFunctionForNode === "min") {
          sourceNode.value = Math.min(value, sourceNode.value);
          targetNode.value = Math.min(value, targetNode.value);
        }
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

const calcRadiusFunction = (radiusBias: number, radiusFactor: number) => {
  return (node: NodeDatum) => (Math.sqrt(node.value) * radiusFactor + radiusBias);
};

const calcDistanceFunction = (radiusBias: number, radiusFactor: number, linkLengthBias: number, linkLengthFactor: number) => {
  const crf = calcRadiusFunction(radiusBias, radiusFactor);
  return (link: LinkDatum) => linkLengthBias
    + (Math.sqrt(link.value) * linkLengthFactor)
    + crf(link.source as NodeDatum)
    + crf(link.target as NodeDatum);
};

const calcStrengthFunction = (linkStrengthBias: number, linkStrengthFactor: number) => {
  return (link: LinkDatum) => linkStrengthBias
    + (Math.sqrt(link.value) * linkStrengthFactor)
};

const calcLinkWidthFunction = (linkWidthBias: number, linkWidthFactor: number) => {
  return (link: LinkDatum) => (Math.sqrt(link.value) * linkWidthFactor + linkWidthBias);
};

const resetPosition = (node: NodeDatum, width: number, height: number) => {
  // I just only need a fixed position for node.id.
  const s = 65536;
  const hash = Math.abs(hashcode(node.id));
  const x = Math.floor(hash % s) / s;
  const y = Math.floor((hash / s) % s) / s;
  node.x = x * width;
  node.y = y * height;
};

const createCallback = (
  state: State,
  dispatchState: (state: State) => void,
  f: (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) => (Partial<State> | undefined)
): (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) => void => {
  return (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) => {
    const newState = f(e);
    if (newState) {
      dispatchState({
        ...state,
        ...f(e)
      });
    }
  }
};

const Root = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

const LeftPanel = styled.div`
  width: 20%;
  height: 100%;
`;

const RightPanel = styled.div`
  width: 80%;
  height: 100%;
`;

const ValuesTextArea = styled.textarea`
  width: 90%;
  height: 30em;
`;

const NumberInput = styled.input`
  width: 5em;
`;

const ExecButton = styled.button`
  width: 90%;
`;
