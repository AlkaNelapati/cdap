/*
 * Copyright © 2017 Cask Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
*/

import React, {Component, PropTypes} from 'react';
import IconSVG from 'components/IconSVG';
import T from 'i18n-react';
import DataPrepBrowserStore from 'components/DataPrep/DataPrepBrowser/DataPrepBrowserStore';
import {setActiveBucket, fetchBuckets} from 'components/DataPrep/DataPrepBrowser/DataPrepBrowserStore/ActionCreator';
import BucketDataView from 'components/DataPrep/DataPrepBrowser/S3Browser/BucketData';
import BucketsList from 'components/DataPrep/DataPrepBrowser/S3Browser/BucketsList';
import {Route, Switch, Redirect} from 'react-router-dom';
import queryString from 'query-string';
import {objectQuery} from 'services/helpers';

require('./S3Browser.scss');
const RouteToS3Home = (match) => {
  let path = match.location.pathname;
  path = path[path.length - 1] === '/' ? path.slice(0, path.length - 1) : path;
  return <Redirect to={`${path}/buckets`} />;
};

const PREFIX = 'features.DataPrep.DataPrepBrowser.S3Browser';
export default class S3Browser extends Component {
  static propTypes = {
    toggle: PropTypes.func,
    location: PropTypes.object,
    match: PropTypes.object,
    enableRouting: PropTypes.bool,
    onWorkspaceCreate: PropTypes.func
  };

  static defaultProps = {
    enableRouting: true
  };

  componentDidMount() {
    console.log(this.props);
    console.log('get active bucket and prefix if available');
  }

  listingInfo = () => {
    let {s3} = DataPrepBrowserStore.getState();

    if (!s3.activeBucket) {
      return `${s3.buckets.length} Buckets`;
    }

    return `10 Files and Directories`;
  }

  renderContentBody = () => {
    let {activeBucket} = DataPrepBrowserStore.getState().s3;
    let BASEPATH = '/ns/:namespace/connections/s3/:s3Id';
    if (this.props.enableRouting) {
      return (
        <Switch>
          <Route
            exact
            path={`${BASEPATH}`}
            render={RouteToS3Home}
          />
          <Route
            exact
            path={`${BASEPATH}/buckets`}
            render={(match) => {
              let s3Id = match.match.params.s3Id;
              fetchBuckets(s3Id);
              return <BucketsList />;
            }}
          />
          <Route
            path={`${BASEPATH}/buckets/:bucketId`}
            render={(match) => {
              let bucketId = match.match.params.bucketId;
              let {prefix} = queryString.parse(objectQuery(this.props, 'location', 'search'));
              setActiveBucket(bucketId, prefix);
              return <BucketDataView />;
            }}
          />
          <Route render={RouteToS3Home} />
        </Switch>
      );
    }
    return !activeBucket.length ? <BucketsList /> : <BucketDataView />;
  };

  render() {
    return (
      <div className="s3-browser">
        <div className="top-panel">
          <div className="title">
            <h5>
              <span
                className="fa fa-fw"
                onClick={this.props.toggle}
              >
                <IconSVG name="icon-bars" />
              </span>

              <span>
                {T.translate(`${PREFIX}.TopPanel.selectData`)}
              </span>
            </h5>
          </div>
        </div>
        <div className="sub-panel clearfix">
          <div className="float-xs-right">
            <span className="info">
              {this.listingInfo()}
            </span>
            <div className="search-container">
              <input type="text" className="form-control" placeholder="Search this directory" value="" />
            </div>
          </div>
        </div>
        <div className="s3-content">
          {this.renderContentBody()}
        </div>
      </div>
    );
  }
}
