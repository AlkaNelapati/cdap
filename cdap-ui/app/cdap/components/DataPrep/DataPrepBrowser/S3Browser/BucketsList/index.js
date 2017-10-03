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
import {connect} from 'react-redux';
import LoadingSVGCentered from 'components/LoadingSVGCentered';
import {Link} from 'react-router-dom';
import {setActiveBucket} from 'components/DataPrep/DataPrepBrowser/DataPrepBrowserStore/ActionCreator';
import {preventPropagation} from 'services/helpers';

const onClickHandler = (bucketId, e) => {
  setActiveBucket(bucketId);
  preventPropagation(e);
  return false;
};

const BucketsList = ({buckets, loading, enableRouting}) => {
  if (loading) {
    return <LoadingSVGCentered />;
  }
  let pathname = window.location.pathname.replace(/\/cdap/, '');
  let ContainerElement = enableRouting ? Link : 'div';

  return (
    <div>
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
        <div className="s3-buckets">
          {
            buckets.map(bucket => (
              <ContainerElement
                to={`${pathname}/${bucket.name}`}
                isNativeLink={!enableRouting}
                onClick={onClickHandler.bind(null, bucket.name)}
              >
                <div className="row">
                  <div className="col-xs-4">
                    {bucket.name}
                  </div>
                  <div className="col-xs-4">
                    {bucket.owner['display-name']}
                  </div>
                  <div className="col-xs-4">
                    {bucket['creation-date']}
                  </div>
                </div>
              </ContainerElement>
            ))
          }
        </div>
      </div>
    </div>
  );
};

BucketsList.propTypes = {
  buckets: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  enableRouting: PropTypes.bool
};


const mapStateToProps = (state, ownProps) => {
  let {enableRouting = true} = ownProps;
  return {
    buckets: state.s3.buckets,
    loading: state.s3.loading,
    enableRouting
  };
};

const BucketsListWrapper = connect(
  mapStateToProps
)(BucketsList);

export default BucketsListWrapper;
