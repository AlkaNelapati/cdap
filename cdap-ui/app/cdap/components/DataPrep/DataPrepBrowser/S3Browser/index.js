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
import BucketDataView from 'components/DataPrep/DataPrepBrowser/S3Browser/BucketData';
import BucketsList from 'components/DataPrep/DataPrepBrowser/S3Browser/BucketsList';

require('./S3Browser.scss');

const PREFIX = 'features.DataPrep.DataPrepBrowser.S3Browser';
export default class S3Browser extends Component {
  static propTypes = {
    toggle: PropTypes.func
  };

  listingInfo = () => {
    let {s3} = DataPrepBrowserStore.getState();

    if (!s3.activeBucket) {
      return `${s3.buckets.length} Buckets`;
    }

    return `10 Files and Directories`;
  }

  render() {
    let {activeBucket} = DataPrepBrowserStore.getState().s3;
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
          <div className="s3-content-header">
            <div className="row">
              <div className="col-xs-4">
                Name
              </div>
              <div className="col-xs-4">
                Owner
              </div>
              <div className="col-xs-4">
                Last Modified
              </div>
            </div>
          </div>
          <div className="s3-content-body">
            {
              !activeBucket.length ? <BucketsList /> : <BucketDataView />
            }
          </div>
        </div>
      </div>
    );
  }
}
