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

import React, {PropTypes} from 'react';
import DataPrepBrowserStore from 'components/DataPrep/DataPrepBrowser/DataPrepBrowserStore';
import {connect, Provider} from 'react-redux';
import {Link} from 'react-router-dom';
import LoadingSVGCentered from 'components/LoadingSVGCentered';

const BucketData = ({data}) => {
  if (!Object.keys(data).length) {
    return null;
  }
  let files = data['object-summaries'];
  let directories = data.directories.map(directory => ({key: directory}));
  let pathname = window.location.pathname.replace(/\/cdap/, '');
  let {loading} = DataPrepBrowserStore.getState().s3;
  if (loading) {
    return <LoadingSVGCentered />;
  }
  return (
    <div>
      <div className="s3-content-header">
        <div className="row">
          <div className="col-xs-3">
            Name
          </div>
          <div className="col-xs-3">
            Storage Class
          </div>
          <div className="col-xs-3">
            Size
          </div>
          <div className="col-xs-3">
            Last Modified
          </div>
        </div>
      </div>
      <div className="s3-content-body">
        <div className="s3-buckets">
          {
            files.concat(directories).map(file => (
              <Link to={`${pathname}?prefix=${file.key}`}>
                <div className="row">
                  <div className="col-xs-3">
                    {file.key}
                  </div>
                  <div className="col-xs-3">
                    {file['storage-class']}
                  </div>
                  <div className="col-xs-3">
                    {file['size']}
                  </div>
                  <div className="col-xs-3">
                    {file['last-modified']}
                  </div>
                </div>
              </Link>
            ))
          }
        </div>
      </div>
    </div>
  );
};

BucketData.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object)
};

const mapStateToProps = (state) => {
  return {
    data: state.s3.activeBucketDetails
  };
};

const BucketDataWrapper = connect(
  mapStateToProps
)(BucketData);

const BucketDataView = () => (
  <Provider store={DataPrepBrowserStore}>
    <BucketDataWrapper />
  </Provider>
);
export default BucketDataView;
