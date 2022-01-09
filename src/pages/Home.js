import React, { useEffect, useState } from "react";
import axios from "axios";
import config, { searchEngines } from "../config";
import { Radio, Input, Button } from "tdesign-react";
import { SearchIcon } from "tdesign-icons-react";
import { useDetectClickOutside } from "react-detect-click-outside";

export default function Home() {
  const [background, setBackground] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentEngine, setCurrentEngine] = useState(
    JSON.parse(localStorage.getItem("defaultSearchEngine")) || searchEngines[0]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchBoxFocus, setSearchBoxFocus] = useState(false);
  const [sug, setSug] = useState([]);
  const ref = useDetectClickOutside({
    onTriggered: () => setSearchBoxFocus(false)
  })
  const getBg = () => {
    axios.get(config.backgroundApi).then((data) => {
      setBackground(data.data.data);
      document
        .getElementsByTagName("body")[0]
        .setAttribute(
          "style",
          `background: url('${data.data.data.fullSrc}') no-repeat 0 0; z-index: 10000`
        );
    });
  };
  setInterval(() => {
    setCurrentTime(new Date());
  }, 5000);
  const getSug = (query) => {
    /**
     * @abstract 获取百度搜索词自动补全，from https://www.cnblogs.com/woider/p/5805248.html .
     * @param query: 搜索词
     */
    if (!query) query = " ";
    const sugurl =
      "http://suggestion.baidu.com/su?wd=#content#&cb=window.baidu.sug".replace(
        "#content#",
        query
      );

    window.baidu = {
      sug: (res) => {
        setSug(res.s);
      },
    };

    var script = document.createElement("script");
    script.src = sugurl;
    document.getElementsByTagName("head")[0].appendChild(script);
  };
  const getTime = (t) => {
    return t < 10 ? `0${t}` : t.toString();
  };
  const search = (query = null) => {
    if (query !== null && query.replaceAll(" ", "") !== "") {
      window.open(currentEngine.url + query);
      // window.location.href = currentEngine.url + searchQuery;
    } else if (searchQuery.replaceAll(" ", "") !== "") {
      window.open(currentEngine.url + searchQuery);
      // window.location.href = currentEngine.url + query;
    }
  };
  useEffect(getBg, []);
  return (
    <div className="main-container">
      <div className="text-center" style={{ marginBottom: "20px" }}>
        <h1 className="search-heading">
          {getTime(currentTime.getHours())}:{getTime(currentTime.getMinutes())}
        </h1>
      </div>
      <div className="text-center" style={{ marginBottom: "20px" }}>
        <Radio.Group
          variant="default-filled"
          defaultValue={0}
          value={currentEngine.index}
          onChange={(e) => {
            setCurrentEngine(searchEngines[e]);
            localStorage.setItem(
              "defaultSearchEngine",
              JSON.stringify(searchEngines[e])
            );
          }}
        >
          {searchEngines.map((value, index) => {
            return (
              <Radio.Button value={value.index} key={index}>
                {value.name}
              </Radio.Button>
            );
          })}
        </Radio.Group>
      </div>
      <div
        className="text-center"
        style={{ paddingLeft: "20%", paddingRight: "20%" }}
        onKeyDown={(e) => {
          if (searchBoxFocus && e.key === "Enter") {
            e.preventDefault();
            search();
          }
        }}
        ref={ref}
      >
        <Input
          placeholder={`搜索 ${currentEngine.name}`}
          value={searchQuery}
          clearable
          onChange={(value) => {
            setSearchQuery(value);
            getSug(value);
          }}
          className="search-box"
          size="large"
          onFocus={() => setSearchBoxFocus(true)}
        />
        <span>
          <Button
            shape="circle"
            icon={<SearchIcon />}
            className="search-btn"
            onClick={() => {
              search();
            }}
          />
        </span>
        <br />
        {sug.length && searchBoxFocus ? (
          <div className="search-sug-container">
            <div className="search-sug text-center">
              {sug.map((value, index) => {
                return (
                  <div
                    className="search-sug-item"
                    key={index}
                    onClick={() => {
                      setSearchQuery(value);
                      search(value);
                    }}
                  >
                    {value}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
      <p className="bg-source" onClick={() => window.open(background.fullSrc)}>{background.copyright}</p>
      <div className="search-footer">
        <footer className="text-center">
          Copyright &copy; 2022 By{" "}
          <a
            href="https://github.com/samzhangjy"
            target="_blank"
            rel="noreferrer"
          >
            samzhangjy
          </a>
        </footer>
      </div>
    </div>
  );
}
